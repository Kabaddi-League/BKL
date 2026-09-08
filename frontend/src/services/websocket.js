import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

let stompClient = null;
let isConnected = false;

export const initWebSocket = (onAuctionUpdate, onTimerTick, onConnectionChange) => {
  const socket = new SockJS('http://localhost:8080/ws-auction');
  stompClient = new Client({
    webSocketFactory: () => socket,
    reconnectDelay: 3000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
    debug: (str) => {
      // console.log('[STOMP]', str);
    },
    onConnect: () => {
      isConnected = true;
      if (onConnectionChange) onConnectionChange(true);

      stompClient.subscribe('/topic/auction-updates', (message) => {
        if (message.body) {
          try {
            const data = JSON.parse(message.body);
            if (onAuctionUpdate) onAuctionUpdate(data);
          } catch (e) {
            console.error('Error parsing STOMP message:', e);
          }
        }
      });

      stompClient.subscribe('/topic/timer', (message) => {
        if (message.body) {
          try {
            const data = JSON.parse(message.body);
            if (onTimerTick) onTimerTick(data);
          } catch (e) {
            console.error('Error parsing STOMP timer message:', e);
          }
        }
      });
    },
    onDisconnect: () => {
      isConnected = false;
      if (onConnectionChange) onConnectionChange(false);
    },
    onStompError: (frame) => {
      console.error('STOMP Error:', frame.headers['message']);
      isConnected = false;
      if (onConnectionChange) onConnectionChange(false);
    }
  });

  stompClient.activate();

  return () => {
    if (stompClient) {
      stompClient.deactivate();
    }
  };
};

export const isWsConnected = () => isConnected;
