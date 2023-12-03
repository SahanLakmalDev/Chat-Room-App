package lk.ijse.dep11.app.wscontroller;

import com.fasterxml.jackson.core.JacksonException;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lk.ijse.dep11.app.to.MessageTO;
import org.apache.commons.logging.Log;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.Errors;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

public class ChatWSController extends TextWebSocketHandler {
    private final List<WebSocketSession> webSocketSessionList = new ArrayList<>();

    @Autowired
    private ObjectMapper mapper;

    @Autowired
    private LocalValidatorFactoryBean validatorFactoryBean;

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        super.afterConnectionEstablished(session);
        webSocketSessionList.add(session);
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        super.afterConnectionClosed(session, status);
        webSocketSessionList.remove(session);
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        super.handleTextMessage(session, message);
        String payload = message.getPayload();

        try {
            MessageTO messageObj = mapper.readValue(payload, MessageTO.class);
            Errors errors = (Errors) validatorFactoryBean.validate(messageObj);

            if(errors.hasErrors()){
                session.sendMessage(new TextMessage("Invalid Message schema"));
            }else {
                broadcastMessage(session, messageObj);
            }
        }catch (JacksonException exp){
            session.sendMessage(new TextMessage("Invalid JSON"));
        }
    }
    private void broadcastMessage(WebSocketSession senderSession, MessageTO messageTO) throws IOException {
        String jsonMessage = mapper.writeValueAsString(messageTO);
        TextMessage textMessage = new TextMessage(jsonMessage);

        for(WebSocketSession session : webSocketSessionList){
            if(!session.equals(senderSession)){
                session.sendMessage(textMessage);
            }
        }
    }
}
