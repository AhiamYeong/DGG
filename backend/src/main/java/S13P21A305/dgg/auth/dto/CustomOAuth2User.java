package S13P21A305.dgg.auth.dto;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;

public class CustomOAuth2User implements OAuth2User {

    private final MemberDTO memberDTO;

    public CustomOAuth2User(MemberDTO memberDTO){
        this.memberDTO = memberDTO;
    }

    @Override
    public Map<String, Object> getAttributes() {
        return null;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {

//        Collection<GrantedAuthority> collection = new ArrayList<>();
//        collection.add(() -> "ROLE_" + memberDTO.getRole());
//        return collection;

        // 토큰의 role이 "GUEST"/"MEMBER"라면 여기서 ROLE_ 접두사 붙여줌
        String rawRole = memberDTO.getRole();              // e.g. "GUEST"
        String roleWithPrefix = rawRole.startsWith("ROLE_")
                ? rawRole
                : "ROLE_" + rawRole;                       // e.g. "ROLE_GUEST"

        return List.of(new SimpleGrantedAuthority(roleWithPrefix));

    }

    // dgg 고유 member id
    public Integer getMemberId(){
        return Integer.valueOf(memberDTO.getMemberId());
    }

    // nickname
    public String getName(){
        return String.valueOf(memberDTO.getName());
    }

}
