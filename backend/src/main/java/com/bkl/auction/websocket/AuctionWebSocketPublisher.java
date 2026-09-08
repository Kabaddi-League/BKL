package com.bkl.auction.websocket;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
public class AuctionWebSocketPublisher {

    private final SimpMessagingTemplate messagingTemplate;

    public AuctionWebSocketPublisher(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public void publishAuctionUpdate(String eventType, Object payload) {
        Map<String, Object> message = new HashMap<>();
        message.put("type", eventType);
        message.put("payload", payload);
        message.put("timestamp", System.currentTimeMillis());
        messagingTemplate.convertAndSend("/topic/auction-updates", message);
    }

    public void publishTimerTick(int secondsRemaining, boolean active) {
        Map<String, Object> message = new HashMap<>();
        message.put("type", "TIMER_TICK");
        message.put("secondsRemaining", secondsRemaining);
        message.put("active", active);
        message.put("timestamp", System.currentTimeMillis());
        messagingTemplate.convertAndSend("/topic/timer", message);
    }
}
