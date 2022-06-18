#iChannel0 "self"

#define PI 3.1416
#define PI2 6.2832
#define STEPS 9.5696

const float lineWidth = 3.0, N = 50.0, angle = 0.2; // width, number, angle
const vec4 colorScheme = vec4(0.0, - 2.1, 2.1, 1.0);

vec2 cos_sin(float a) {
    return vec2(cos(a), sin(a));
}

// random function
float random(float x) {
    return 2.0 * fract(456.68 * sin(1e3 * x+mod(iDate.a, 100.0))) - 1.0; // Option 1
    // return 2.0 * fract(456.68 * sin(1e3 * x+mod(iTime, 100.0))) - 1.0; // Option 2
}

// get the current texture of location
vec4 get_texture(vec2 uv) {
    return textureLod(iChannel0, uv, 0.0);
}

// draw a spiral line
vec4 spiral(vec2 coord, vec4 current, float x) {
    return smoothstep(lineWidth, 0.0, length(current.xy - coord)) * (0.5 + 0.5 * sin(PI2 * x / N + colorScheme));
}

void mainImage(out vec4 fragColor, in vec2 fragCoord)
{
    vec2 RES = iResolution.xy;
    vec2 uv = fragCoord / iResolution.xy;
    
    if (get_texture(RES).x == 0.0) {
        fragCoord = abs(uv * 2.0 - 1.0);
        fragColor = vec4(max(fragCoord.x, fragCoord.y) > 1.0 - lineWidth / RES.y);
        fragColor.a = 0.0;
        return;
    }
    
    // pick random location to start drawing
    if (fragCoord.y == 0.5 && get_texture(uv).a == 0.0) {
        fragColor = vec4(RES / 2.0 + RES / 2.4 * vec2(random(fragCoord.x), random(fragCoord.x + 0.5)), PI * random(fragCoord.x + 0.2), 1.0);
        
        if (get_texture(fragColor.xy / RES).x > 0.0) { fragColor.a = 0.0; };
        
        return;
    }
    
    fragColor = get_texture(uv);
    
    // loop over the spirals
    for(float x = 0.5; x < N; x ++ ) {
        vec4 pct = get_texture(vec2(x, 0.5) / RES);
        if (pct.a > 0.0) {
            fragColor += spiral(fragCoord, pct, x);
        }
    }
    
    // circle packing
    if (fragCoord.y == 0.5) {
        vec4 pct = get_texture(uv);
        
        if (pct.a > 0.0) {
            // closest distance to create new circles
            float a = pct.z - 0.4, a0 = a; // Option to change the distance of spirals
            
            while(get_texture((pct.xy + (lineWidth + 2.0) * cos_sin(a)) / RES).a == 0.0 && a < STEPS) { a += angle; }
            
            // calculate the gap between lines
            a = max(a0, a - 4.0 * angle); // Option to change the gap of spiral lines
            
            // when drawing is stopped, create a new circle
            if (get_texture((pct.xy + (lineWidth + 2.0) * cos_sin(a)) / RES).a > 0.0) { // Option to change the partern, 0.0 or other values, can try 0.05
                fragColor.a = 0.0;
                return;
            }
            
            // drawing
            fragColor = vec4(pct.xy + cos_sin(a), mod(a, PI2), pct.a + 1.0);
        }
    }
}