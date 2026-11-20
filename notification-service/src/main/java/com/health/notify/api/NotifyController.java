package com.health.notify.api;
import com.fasterxml.jackson.databind.ObjectMapper; import com.health.notify.model.Notification; import com.health.notify.repo.NotificationRepository;
import org.springframework.http.HttpStatus; import org.springframework.web.bind.annotation.*; import java.util.Map; import java.util.List;
@RestController @RequestMapping("/api/notify")
public class NotifyController {
  private final NotificationRepository repo; private final ObjectMapper om;
  public NotifyController(NotificationRepository r, ObjectMapper o){ this.repo=r; this.om=o; }
  @GetMapping
  public List<Notification> all() {
    return repo.findAll();
  }
  @PostMapping @ResponseStatus(HttpStatus.ACCEPTED)
  public Map<String,Object> accept(@RequestBody Map<String,Object> payload) throws Exception {
    String type = (String) payload.getOrDefault("type","GENERIC");
    Notification n=new Notification(); n.setType(type); n.setPayloadJson(om.writeValueAsString(payload)); repo.save(n);
    return Map.of("status","queued","id",n.getId());
  }
}
