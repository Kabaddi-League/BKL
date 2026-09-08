package com.bkl.auction.repository;

import com.bkl.auction.model.Team;
import com.bkl.auction.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface TeamRepository extends JpaRepository<Team, Long> {
    Optional<Team> findByNameIgnoreCase(String name);
    Optional<Team> findByCaptain(User captain);
    Optional<Team> findByCaptainId(Long captainId);
}
