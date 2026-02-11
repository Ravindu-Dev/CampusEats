package com.campuseats.service;

import com.campuseats.model.User;
import com.campuseats.model.CanteenOwner;
import com.campuseats.model.Admin;
import com.campuseats.repository.UserRepository;
import com.campuseats.repository.CanteenOwnerRepository;
import com.campuseats.repository.AdminRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.HashSet;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

        private final UserRepository userRepository;
        private final CanteenOwnerRepository canteenOwnerRepository;
        private final AdminRepository adminRepository;

        @Override
        @Transactional
        public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
                // First try to find as regular user by username
                var optionalUser = userRepository.findByUsername(username);
                if (optionalUser.isPresent()) {
                        User user = optionalUser.get();
                        Set<GrantedAuthority> authorities = user.getRoles().stream()
                                        .map(role -> new SimpleGrantedAuthority("ROLE_" + role))
                                        .collect(Collectors.toSet());

                        return new org.springframework.security.core.userdetails.User(
                                        user.getUsername(),
                                        user.getPassword(),
                                        user.isEnabled(),
                                        true,
                                        true,
                                        true,
                                        authorities);
                }

                // If not found, try to find as canteen owner by email
                var optionalOwner = canteenOwnerRepository.findByEmail(username);
                if (optionalOwner.isPresent()) {
                        CanteenOwner owner = optionalOwner.get();
                        Set<GrantedAuthority> authorities = new HashSet<>();
                        authorities.add(new SimpleGrantedAuthority("ROLE_CANTEEN_OWNER"));

                        return new org.springframework.security.core.userdetails.User(
                                        owner.getEmail(),
                                        owner.getPassword(),
                                        owner.isEnabled(),
                                        true,
                                        true,
                                        true,
                                        authorities);
                }

                // If not found, try to find as admin by email
                var optionalAdmin = adminRepository.findByEmail(username);
                if (optionalAdmin.isPresent()) {
                        Admin admin = optionalAdmin.get();
                        Set<GrantedAuthority> authorities = admin.getRoles().stream()
                                        .map(role -> new SimpleGrantedAuthority("ROLE_" + role))
                                        .collect(Collectors.toSet());

                        return new org.springframework.security.core.userdetails.User(
                                        admin.getEmail(),
                                        admin.getPassword(),
                                        admin.isEnabled(),
                                        true,
                                        true,
                                        true,
                                        authorities);
                }

                throw new UsernameNotFoundException("User not found with username: " + username);
        }
}
