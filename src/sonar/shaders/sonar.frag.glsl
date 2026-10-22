precision highp float;

#define MAX_PULSES 3

uniform vec3 uPulseOrigins[MAX_PULSES];
uniform float uPulseRadii[MAX_PULSES];
uniform float uPulseAges[MAX_PULSES];
uniform int uPulseCount;

uniform float uBandWidth;
uniform float uFadeDuration;
uniform float uPulseSpeed;
uniform float uMaxRadius;

uniform vec3 uSurfaceColor;
uniform vec3 uWaveColor;

varying vec3 vWorldPosition;
varying vec3 vWorldNormal;

void main() {
    float intensity = 0.0;

    for (int i = 0; i < MAX_PULSES; i++) {
        if (i >= uPulseCount) break;

        float distanceToOrigin = length(vWorldPosition - uPulseOrigins[i]);

        float radius = uPulseRadii[i];

        float arrivalTime = distanceToOrigin / uPulseSpeed;

        float timeSinceArrival = uPulseAges[i] - arrivalTime;

        float frontDistance = abs(distanceToOrigin - radius);

        float waveFront = 1.0 - smoothstep(0.0, uBandWidth, frontDistance);

        float trail = 0.0;

        if (timeSinceArrival >= 0.0 && distanceToOrigin <= uMaxRadius) {
            trail = exp(-3.0 * timeSinceArrival / uFadeDuration);
        }

        intensity = max(intensity, max(waveFront, trail * 0.42));
    }

    intensity = clamp(intensity, 0.0, 1.0);

    vec3 normal = normalize(vWorldNormal);

    float orientation = 0.75 + 0.25 * abs(normal.y);

    vec3 base = vec3(0.003);

    vec3 surface = uSurfaceColor * intensity * orientation;

    vec3 highlight = uWaveColor * pow(intensity, 3.0) * 0.25;

    vec3 finalColor = base + surface + highlight;

    gl_FragColor = vec4(finalColor, 1.0);
}