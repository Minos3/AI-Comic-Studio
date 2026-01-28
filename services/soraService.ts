import { SoraGenerationMode } from '../types';

export interface SoraParams {
    prompt: string;
    duration: number;
    mode: SoraGenerationMode;
    resolution?: string;
    inputImage?: string;
    startFrame?: string;
    endFrame?: string;
    sourceVideo?: string;
}

export const generateVideo = async (params: SoraParams): Promise<{ success: boolean; taskId: string }> => {
    console.log("Starting SORA2 generation with params:", params);

    // Simulate API latency
    await new Promise(resolve => setTimeout(resolve, 2000));

    return {
        success: true,
        taskId: `sora_${Date.now()}`
    };
};

export const pollTaskStatus = async (taskId: string): Promise<{ status: string; videoUrl?: string }> => {
    // In a real app, this would check the backend
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({
                status: 'success',
                videoUrl: 'https://media.w3.org/2010/05/sintel/trailer.mp4'
            });
        }, 5000);
    });
};
