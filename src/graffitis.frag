#iChannel0 "file://./buffer.frag"

void mainImage(out vec4 fragColor, in vec2 fragCoord)
{
    vec2 uv = fragCoord / iResolution.xy;
    vec3 color = texture(iChannel0, uv).rgb;
    
    fragColor = vec4(color, 1.0);
}
