package com.bkl.auction.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Service
public class SupabaseStorageService {

    private static final Logger log = LoggerFactory.getLogger(SupabaseStorageService.class);
    private static final long MAX_FILE_SIZE_BYTES = 1024 * 1024; // 1 MB limit

    @Value("${supabase.url:}")
    private String supabaseUrl;

    @Value("${supabase.key:}")
    private String supabaseKey;

    @Value("${supabase.bucket:profile-images}")
    private String bucketName;

    private final Path uploadDir = Paths.get("uploads/profile-images");

    public SupabaseStorageService() {
        try {
            Files.createDirectories(uploadDir);
            Files.createDirectories(uploadDir.resolve("players"));
            Files.createDirectories(uploadDir.resolve("captains"));
            Files.createDirectories(uploadDir.resolve("auctioneers"));
        } catch (IOException e) {
            log.error("Could not create local upload directories: ", e);
        }
    }

    public String uploadProfileImage(MultipartFile file, String folder, String filenamePrefix) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Selected file is empty.");
        }

        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new IllegalArgumentException("Profile image must be 1 MB or smaller. Current size: "
                    + (file.getSize() / 1024) + " KB.");
        }

        String contentType = file.getContentType();
        if (contentType == null || (!contentType.equals("image/jpeg") &&
                !contentType.equals("image/jpg") &&
                !contentType.equals("image/png") &&
                !contentType.equals("image/webp"))) {
            throw new IllegalArgumentException("Only JPG, JPEG, PNG, and WEBP formats are allowed.");
        }

        String extension = "jpg";
        if (contentType.equals("image/png")) extension = "png";
        else if (contentType.equals("image/webp")) extension = "webp";

        String cleanFolderName = (folder != null && !folder.isBlank()) ? folder.toLowerCase() : "players";
        String uniqueFilename = filenamePrefix + "_" + System.currentTimeMillis() + "." + extension;
        String objectPath = cleanFolderName + "/" + uniqueFilename;

        // If Supabase URL and Key are provided, upload to Supabase
        if (supabaseUrl != null && !supabaseUrl.isEmpty() && supabaseKey != null && !supabaseKey.isEmpty()) {
            try {
                return uploadToSupabase(file.getBytes(), contentType, objectPath);
            } catch (Exception e) {
                log.error("Failed to upload to Supabase: ", e);
                throw new RuntimeException("Could not upload to Supabase Storage: " + e.getMessage());
            }
        }

        // Fallback: Local Storage
        try {
            Path targetFolder = uploadDir.resolve(cleanFolderName);
            Files.createDirectories(targetFolder);
            Path destination = targetFolder.resolve(uniqueFilename);
            file.transferTo(destination.toFile());

            // Return relative or full URL for display
            return "/api/images/" + cleanFolderName + "/" + uniqueFilename;
        } catch (IOException e) {
            log.error("Failed to store image locally: ", e);
            throw new RuntimeException("Could not store image file. Please try again.");
        }
    }

    private String uploadToSupabase(byte[] fileBytes, String contentType, String objectPath) throws IOException, InterruptedException {
        String endpoint = supabaseUrl + "/storage/v1/object/" + bucketName + "/" + objectPath;

        java.net.http.HttpClient client = java.net.http.HttpClient.newHttpClient();
        java.net.http.HttpRequest request = java.net.http.HttpRequest.newBuilder()
                .uri(java.net.URI.create(endpoint))
                .header("Authorization", "Bearer " + supabaseKey)
                .header("apikey", supabaseKey)
                .header("Content-Type", contentType)
                .POST(java.net.http.HttpRequest.BodyPublishers.ofByteArray(fileBytes))
                .build();

        java.net.http.HttpResponse<String> response = client.send(request, java.net.http.HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() >= 200 && response.statusCode() < 300) {
            // Return public URL
            return supabaseUrl + "/storage/v1/object/public/" + bucketName + "/" + objectPath;
        } else {
            throw new RuntimeException("Supabase upload failed: " + response.statusCode() + " " + response.body());
        }
    }
}
