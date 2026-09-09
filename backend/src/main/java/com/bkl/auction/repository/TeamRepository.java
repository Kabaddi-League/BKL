package com.bkl.auction.repository;

import com.bkl.auction.model.Team;
import com.bkl.auction.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface TeamRepository extends JpaRepository<Team, Long> {
    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"captain"})
    java.util.List<Team> findAll();

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"captain"})
    Optional<Team> findById(Long id);

    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("SELECT t FROM Team t WHERE t.id = :id")
    Optional<Team> findByIdWithLock(@org.springframework.data.repository.query.Param("id") Long id);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"captain"})
    Optional<Team> findByNameIgnoreCase(String name);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"captain"})
    Optional<Team> findByCaptain(User captain);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"captain"})
    Optional<Team> findByCaptainId(Long captainId);
}
