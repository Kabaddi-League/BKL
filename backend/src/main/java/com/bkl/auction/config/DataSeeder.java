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
            if (userRepository.count() > 0) {
                log.info("Database already contains data. Skipping initial seeding.");
                ensureInitialAuctionState();
                return;
            }
        } catch (Exception e) {
            log.warn("Could not check user count directly, proceeding with seeding: {}", e.getMessage());
        }

        log.info("Starting BKL Data Seeding...");

        // 1. Seed Admin Accounts
        User admin1 = createOrGetUser("mrigankharsh@gmail.com", "mrigankharsh@gmail.com", "Harsh Mrigank", "9308354518", "4th", Role.SUPER_ADMIN);
        User admin2 = createOrGetUser("harshitkumar4840@gmail.com", "harshitkumar4840@gmail.com", "Harshit Kumar", "9800000000", "4th", Role.AUCTIONEER);

        // 2. Define Pool Email Sets
        Set<String> poolAEmails = new HashSet<>(Arrays.asList(
                "singh171761@gmail.com",      // Shivam Kumar
                "angshujha2005@gmail.com",    // Angshu Jha
                "dimpu108111@gmail.com",      // Siddharth Kumar
                "mayankraj02012006@gmail.com",// Mayank
                "mrigankharsh@gmail.com"      // Harsh Mrigank
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
                "raushanuuuu44@gmail.com"       // Roushan Kumar/Pandey
        ));

        Set<String> captainEmails = new HashSet<>(Arrays.asList(
                "shaktipipra@gmail.com",         // Shakti Kumar
                "kaushiktejas713@gmail.com",     // Tejas Koushik
                "ragyamsinha@gmail.com",         // Ragyam Sinha
                "mishraankit24x@gmail.com",      // Ankit Mishra
                "harshitchauhan00001@gmail.com"  // Harshit Thala
        ));

        // 3. Read CSV and seed Users & Players
        ClassPathResource resource = new ClassPathResource("registration_data.csv");
        int orderCounter = 1;

        try (BufferedReader br = new BufferedReader(new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8))) {
            String line;
            boolean isHeader = true;
            while ((line = br.readLine()) != null) {
                if (isHeader) {
                    isHeader = false;
                    continue;
                }
                String[] parts = line.split(",", -1);
                if (parts.length < 6) continue;

                String email = parts[1].trim().toLowerCase();
                String rawName = parts[2].trim();
                String mobile = parts[3].trim().replaceAll("\\s+", "");
                String rawYear = parts[4].trim();
                String rawType = parts[5].trim();

                String normalizedYear = normalizeYear(rawYear);
                PlayerType playerType = PlayerType.fromString(rawType);

                Role role = Role.PLAYER;
                if (captainEmails.contains(email)) {
                    role = Role.CAPTAIN;
                } else if (email.equals("mrigankharsh@gmail.com")) {
                    role = Role.SUPER_ADMIN;
                }

                User user = userRepository.findByEmailIgnoreCase(email).orElse(null);
                if (user == null) {
                    user = new User(email, passwordEncoder.encode(email), rawName, mobile, normalizedYear, role);
                    user.setMustChangePassword(true);
                    user = userRepository.save(user);
                }

                // Skip seeding player for SUPER_ADMIN or AUCTIONEER if they aren't playing, 
                // but Harsh Mrigank is playing (in Pool A), so we include him.
                // Captains don't go to auction pool
                if (captainEmails.contains(email)) {
                    continue; // Captains are assigned directly to teams, not in auction pool
                }

                // Determine Pool
                Pool pool;
                if (poolAEmails.contains(email)) {
                    pool = Pool.POOL_A;
                } else if (poolBEmails.contains(email)) {
                    pool = Pool.POOL_B;
                } else {
                    pool = Pool.POOL_C;
                }

                Player player = new Player(user, playerType, pool, pool.getBasePrice());
                player.setAuctionOrder(orderCounter++);
                playerRepository.save(player);
            }
        }

        // 4. Seed 5 Teams & Map Captains
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
                Team team = new Team(teamName, captainUser);
                teamRepository.save(team);
            } else {
                log.warn("Captain user not found for email: {}", capEmail);
            }
        }

        // 5. Initialize Auction State
        ensureInitialAuctionState();

        log.info("Data Seeding Completed Successfully. Total Users: {}", userRepository.count());
    }

    private User createOrGetUser(String email, String password, String fullName, String mobile, String year, Role role) {
        return userRepository.findByEmailIgnoreCase(email).orElseGet(() -> {
            User u = new User(email, passwordEncoder.encode(password), fullName, mobile, year, role);
            u.setMustChangePassword(true);
            return userRepository.save(u);
        });
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
            auction.setTimerSeconds(30);
            auctionRepository.save(auction);
        }
    }
}
