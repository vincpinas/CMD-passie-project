interface hdr { 
    hdrJpgEquirectangularMap: THREE.Texture; 
    hdrJpg: QuadRenderer<1016, GainMapDecoderMaterial> 
}

interface modelInfo {
    url: string;
    pos: { x: number; y: number; z: number};
    rot: { x: number; y: number; z: number};
    scale: { x: number; y: number; z: number};
}

interface ExperienceOpts {
    modelInfo: modelInfo;
}