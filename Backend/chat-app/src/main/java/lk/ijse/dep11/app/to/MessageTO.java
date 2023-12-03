package lk.ijse.dep11.app.to;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotEmpty;
import java.io.Serializable;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MessageTO implements Serializable {
    @NotBlank(message = "Chat message can't be empty")
    private String message;
    @NotEmpty(message = "Email can't be empty")
    @Email(message = "Invalid email")
    private String email;
    private String senderPicture;
    private String senderName;
}
