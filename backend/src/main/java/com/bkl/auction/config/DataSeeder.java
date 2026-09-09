package com.bkl.auction.config;

import com.bkl.auction.model.*;
import com.bkl.auction.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Component
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final UserRepository userRepository;
    private final TeamRepository teamRepository;
    private final PlayerRepository playerRepository;
    private final AuctionRepository auctionRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository,
                      TeamRepository teamRepository,
                      PlayerRepository playerRepository,
                      AuctionRepository auctionRepository,
                      PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.teamRepository = teamRepository;
        this.playerRepository = playerRepository;
        this.auctionRepository = auctionRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        try {
            // ALWAYS ensure Admin accounts exist regardless of DB wipe status
            User admin1 = createOrGetUser("harshmrigank@gmail.com", "harshmrigank@gmail.com", "Harsh Mrigank", "9308354518", "4th", Role.SUPER_ADMIN);
            User admin2 = createOrGetUser("harshitkumar4840@gmail.com", "harshitkumar4840@gmail.com", "Harshit Kumar", "9800000000", "4th", Role.AUCTIONEER);

            log.info("Starting BKL Data Seeding from CSV (Idempotent Sync)...");

            // Define Pool Email Sets
            Set<String> poolAEmails = new HashSet<>(Arrays.asList(
                    "singh171761@gmail.com",      // Shivam Kumar
                    "angshujha2005@gmail.com",    // Angshu Jha
                    "dimpu108111@gmail.com",      // Siddharth Kumar
                    "mayankraj02012006@gmail.com",// Mayank
                    "mrigankharsh@gmail.com"      // Harsh Mrigank (Player)
            ));

            Set<String> poolBEmails = new HashSet<>(Arrays.asList(
                    "starc7613@gmail.com",          // Utkarsh
                    "yuvrajmahto270@gmail.com",     // Yuvraj Kumar
                    "kashyapkaushik111@gmail.com",  // Kaushik Kashyap
                    "swarupsarkar058@gmail.com",    // Swarup Kumar Sarkar
                    "monuc9687@gmail.com",          // Aditya Kunar
                    "karmakarkusanku515@gmail.com", // Kusanku Karmakar
                    "ankitbn9123@gmail.com",        // Ankit Raj
                    "avinashchaubey403@gmail.com",  // Avinash Chaubey
                    "raushanpandeyyy@gmail.com",    // Roushan Kumar/Pandey
                    "guptakunal62077@gmail.com",    // Kunal Gupta
                    "rohitsingh6691@gmail.com",     // Ayush singh
                    "mdfarhanahmad70@gmail.com"     // Farhan Hashmi
            ));

            Set<String> captainEmails = new HashSet<>(Arrays.asList(
                    "shaktipipra@gmail.com",         // Shakti Kumar
                    "kaushiktejas713@gmail.com",     // Tejas Koushik
                    "ragyamsinha@gmail.com",         // Ragyam Sinha
                    "mishraankit24x@gmail.com",      // Ankit Mishra
                    "harshitchauhan00001@gmail.com"  // Harshit Thala
            ));

            // Read CSV and seed Users & Players
            // First try reading from the file system directly (for dev environment without rebuilds)
            java.io.File file = new java.io.File("src/main/resources/registration_data.csv");
            java.io.InputStream is;
            if (file.exists()) {
                is = new java.io.FileInputStream(file);
                log.info("Reading CSV from src/main/resources/registration_data.csv directly");
            } else {
                ClassPathResource resource = new ClassPathResource("registration_data.csv");
                is = resource.getInputStream();
                log.info("Reading CSV from classpath");
            }
            
            List<Player> playersToSave = new ArrayList<>();

            try (BufferedReader br = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8))) {
                String line;
                boolean isHeader = true;
                while ((line = br.readLine()) != null) {
                    if (isHeader) {
                        isHeader = false;
                        continue;
                    }
                    String[] parts = line.split(",", -1);
                    if (parts.length < 6) continue;

                    // Strip quotes and trim
                    String email = parts[1].replaceAll("\"", "").trim().toLowerCase();
                    String rawName = parts[2].replaceAll("\"", "").trim();
                    String mobile = parts[3].replaceAll("\"", "").trim().replaceAll("\\s+", "");
                    String rawYear = parts[4].replaceAll("\"", "").trim();
                    String rawType = parts[5].replaceAll("\"", "").trim();

                    String normalizedYear = normalizeYear(rawYear);
                    PlayerType playerType = PlayerType.fromString(rawType);

                    Role role = Role.PLAYER;
                    if (captainEmails.contains(email)) {
                        role = Role.CAPTAIN;
                    } else if (email.equals("harshmrigank@gmail.com")) {
                        role = Role.SUPER_ADMIN;
                    }

                    // Create user with MOBILE number as password
                    User user = userRepository.findByEmailIgnoreCase(email).orElse(null);
                    if (user == null) {
                        user = new User(email, passwordEncoder.encode(mobile), rawName, mobile, normalizedYear, role);
                        user.setMustChangePassword(false);
                        user = userRepository.save(user);
                    } else {
                        // FORCE SYNC ROLE (so Aryan Kumar gets downgraded from captain if needed)
                        if (user.getRole() != Role.SUPER_ADMIN && user.getRole() != Role.AUCTIONEER) {
                            if (user.getRole() != role) {
                                user.setRole(role);
                                user = userRepository.save(user);
                            }
                        }
                    }

                    // Determine Pool
                    Pool pool;
                    if (poolAEmails.contains(email)) {
                        pool = Pool.POOL_A;
                    } else if (poolBEmails.contains(email)) {
                        pool = Pool.POOL_B;
                    } else if (captainEmails.contains(email)) {
                        pool = Pool.UNASSIGNED; // Captains don't have a pool
                    } else {
                        pool = Pool.POOL_C;
                    }

                    // IDEMPOTENT PLAYER CREATION
                    Player player = playerRepository.findByUser(user).orElse(null);
                    if (player == null) {
                        player = new Player(user, playerType, pool, pool.getBasePrice());
                    } else {
                        player.setPlayerType(playerType);
                        player.setPool(pool);
                        // base price might have changed, only update if not SOLD
                        if (player.getAuctionStatus() == null || player.getAuctionStatus() == AuctionStatus.UNASSIGNED) {
                            player.setBasePrice(pool.getBasePrice());
                        }
                    }
                    playersToSave.add(player);
                }
            }
            
            // Sort players: Pool A -> B -> C, then Alphabetical by Name
            playersToSave.sort(Comparator.comparing((Player p) -> p.getPool().name())
                    .thenComparing(p -> p.getUser().getFullName().toLowerCase()));
                    
            // Assign auction order and save
            int orderCounter = 1;
            for (Player p : playersToSave) {
                // Keep existing order if already assigned, otherwise set it
                if (p.getAuctionOrder() == null || p.getAuctionOrder() == 0) {
                    p.setAuctionOrder(orderCounter);
                }
                orderCounter++;
                playerRepository.save(p);
            }

            // Seed 5 Teams & Map Captains
            Map<String, String> teamCaptainMap = new LinkedHashMap<>();
            teamCaptainMap.put("Iron Lobby", "shaktipipra@gmail.com");
            teamCaptainMap.put("Velocity", "kaushiktejas713@gmail.com");
            teamCaptainMap.put("Chain-Breaker", "ragyamsinha@gmail.com");
            teamCaptainMap.put("No Mercy", "mishraankit24x@gmail.com");
            teamCaptainMap.put("Apex Titans", "harshitchauhan00001@gmail.com");

            for (Map.Entry<String, String> entry : teamCaptainMap.entrySet()) {
                String teamName = entry.getKey();
                String capEmail = entry.getValue();
                User captainUser = userRepository.findByEmailIgnoreCase(capEmail).orElse(null);
                
                if (captainUser != null) {
                    // IDEMPOTENT TEAM CREATION
                    Team team = teamRepository.findByNameIgnoreCase(teamName).orElse(null);
                    if (team == null) {
                        team = new Team(teamName, captainUser);
                    } else {
                        team.setCaptain(captainUser);
                    }
                    
                    // Set custom logos based on team name
                    if (teamName.equals("Chain-Breaker")) {
                        team.setLogoUrl("/logos/chain-breaker.jpg");
                    } else if (teamName.equals("No Mercy")) {
                        team.setLogoUrl("/logos/no-mercy.png");
                    } else if (teamName.equals("Velocity")) {
                        team.setLogoUrl("/logos/velocity.png");
                    } else if (teamName.equals("Iron Lobby")) {
                        team.setLogoUrl("/logos/iron-lobby.png");
                    } else if (teamName.equals("Apex Titans")) {
                        team.setLogoUrl("/logos/apex-titans.jpg");
                    }

                    teamRepository.save(team);

                    // Sync captain player status
                    Player capPlayer = playerRepository.findByUser(captainUser).orElse(null);
                    if (capPlayer != null) {
                        capPlayer.setAuctionStatus(AuctionStatus.SOLD);
                        capPlayer.setCurrentTeam(team);
                        capPlayer.setSoldPrice(0); // Captain doesn't cost auction budget
                        playerRepository.save(capPlayer);
                    }
                } else {
                    log.warn("Captain user not found for email: {}", capEmail);
                }
            }

            ensureInitialAuctionState();
            log.info("Data Seeding Completed Successfully. Total Users: {}", userRepository.count());
            
        } catch (Exception e) {
            log.error("Error during data seeding: ", e);
        }
    }

    private User createOrGetUser(String email, String password, String fullName, String mobile, String year, Role role) {
        Optional<User> existing = userRepository.findByEmailIgnoreCase(email);
        if (existing.isPresent()) {
            User u = existing.get();
            // Force update role and password for admins to ensure access
            if (role == Role.SUPER_ADMIN || role == Role.AUCTIONEER) {
                u.setPassword(passwordEncoder.encode(password));
                u.setRole(role);
                userRepository.save(u);
            }
            return u;
        } else {
            User u = new User(email, passwordEncoder.encode(password), fullName, mobile, year, role);
            u.setMustChangePassword(false);
            return userRepository.save(u);
        }
    }

    private String normalizeYear(String year) {
        if (year == null) return "2nd";
        String y = year.trim().toLowerCase();
        if (y.contains("1")) return "1st";
        if (y.contains("2")) return "2nd";
        if (y.contains("3")) return "3rd";
        if (y.contains("4")) return "4th";
        return year;
    }

    private void ensureInitialAuctionState() {
        if (auctionRepository.count() == 0) {
            Auction auction = new Auction();
            auction.setState(AuctionState.IDLE);
            auctionRepository.save(auction);
        }
    }
}
