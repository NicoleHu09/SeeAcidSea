uniform sampler2D globeTexture;
varying vec2 vertexUV;

void main() {
    vec4 textureColor = texture2D(globeTexture, vertexUV);
    gl_FragColor = textureColor;
}