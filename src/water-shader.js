// Analytic noise gradients and crossing waves: no repeating horizontal brightness stripes.
export const waterFragmentShader = `
  uniform sampler2D tDiffuse;
  uniform float time;
  uniform float roughness;
  varying vec4 vUv;
  varying vec3 vWorld;
  float hash(vec2 p){
    vec3 q=fract(vec3(p.xyx)*.1031);
    q+=dot(q,q.yzx+33.33);
    return fract((q.x+q.y)*q.z);
  }
  // xy = spatial gradient, z = height. Cubic interpolation avoids discontinuous slopes.
  vec3 noiseGradient(vec2 p){
    vec2 cell=floor(p),f=fract(p),u=f*f*(3.-2.*f),du=6.*f*(1.-f);
    float a=hash(cell),b=hash(cell+vec2(1,0)),c=hash(cell+vec2(0,1)),d=hash(cell+1.);
    float crossTerm=a-b-c+d;
    return vec3(du.x*(b-a+crossTerm*u.y),du.y*(c-a+crossTerm*u.x),a+(b-a)*u.x+(c-a)*u.y+crossTerm*u.x*u.y);
  }
  void main(){
    vec2 p=vWorld.xz;
    vec2 current=vec2(time*.63,time*.18);
    vec3 swell=noiseGradient(p*.013-current*.012);
    vec2 warped=p+vec2(swell.z,noiseGradient(p*.019+vec2(37.,time*.023)).z)*19.;
    vec3 broad=noiseGradient(warped*.045-current*.045);
    vec3 chop=noiseGradient(warped*.17+vec2(time*.12,-time*.09));
    vec3 fine=noiseGradient(warped*.61-vec2(time*.24,time*.13));
    // Fade subpixel capillary detail instead of letting it shimmer at the horizon.
    float detail=1.-smoothstep(.45,1.7,length(fwidth(p))*.61);
    vec2 slope=broad.xy*.17+chop.xy*.11+fine.xy*.055*detail;
    slope+=vec2(.78,.63)*cos(dot(warped,vec2(.071,.057))-time*.62)*.035;
    slope+=vec2(-.44,.9)*cos(dot(warped,vec2(-.19,.39))+time*1.05)*.018;
    vec3 normal=normalize(vec3(-slope.x,1.,-slope.y));
    vec3 view=normalize(cameraPosition-vWorld);
    float fresnel=.25+.55*pow(1.-max(dot(normal,view),0.),3.);
    float localRoughness=roughness*(.7+.55*swell.z);
    vec2 uv=vUv.xy/vUv.w+slope*(.005+localRoughness*.022);
    vec2 footprint=vec2(.0009,.0021)*(localRoughness+.12);
    vec3 reflected=texture2D(tDiffuse,clamp(uv,vec2(.001),vec2(.999))).rgb*2.;
    float weight=2.;
    // A small disk kernel avoids directional smearing; the footprint varies across the river.
    for(int i=0;i<8;i++){
      float f=float(i)+.5,a=f*2.39996323;
      vec2 offset=vec2(cos(a),sin(a))*sqrt(f/8.)*footprint;
      reflected+=texture2D(tDiffuse,clamp(uv+offset,vec2(.001),vec2(.999))).rgb;
      weight+=1.;
    }
    float glints=.69+.19*chop.z+.14*fine.z*detail;
    vec3 base=vec3(.004,.013,.023)+vec3(.002,.003,.005)*broad.z;
    gl_FragColor=vec4(base+reflected/weight*fresnel*glints,1.);
  }
`;
