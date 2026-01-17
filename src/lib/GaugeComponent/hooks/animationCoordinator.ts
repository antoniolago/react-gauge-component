/**
 * Animation Coordinator - Global animation loop manager for all gauge components
 * 
 * This module provides a centralized animation system that:
 * - Batches animations across all gauge instances into a single RAF loop
 * - Prevents visual stuttering by distributing updates
 * - Allows FPS limiting at the global level
 * - Supports animation priority and staggering
 */

type AnimationCallback = (timestamp: number, deltaTime: number) => boolean; // returns false when complete

interface AnimationEntry {
    id: string;
    callback: AnimationCallback;
    priority: number;
    startTime: number;
}

class AnimationCoordinator {
    private animations: Map<string, AnimationEntry> = new Map();
    private isRunning: boolean = false;
    private lastFrameTime: number = 0;
    private frameId: number | null = null;
    private targetFps: number = 60;
    private minFrameTime: number = 1000 / 60;
    
    // Singleton instance
    private static instance: AnimationCoordinator | null = null;
    
    static getInstance(): AnimationCoordinator {
        if (!AnimationCoordinator.instance) {
            AnimationCoordinator.instance = new AnimationCoordinator();
        }
        return AnimationCoordinator.instance;
    }
    
    /**
     * Set the target FPS for all animations
     */
    setTargetFps(fps: number): void {
        this.targetFps = Math.max(1, Math.min(120, fps));
        this.minFrameTime = 1000 / this.targetFps;
    }
    
    /**
     * Register an animation callback
     * @param id Unique identifier for this animation
     * @param callback Function called each frame, returns false when complete
     * @param priority Higher priority animations are updated first (default: 0)
     */
    register(id: string, callback: AnimationCallback, priority: number = 0): void {
        this.animations.set(id, {
            id,
            callback,
            priority,
            startTime: performance.now()
        });
        
        if (!this.isRunning) {
            this.start();
        }
    }
    
    /**
     * Unregister an animation
     */
    unregister(id: string): void {
        this.animations.delete(id);
        
        if (this.animations.size === 0) {
            this.stop();
        }
    }
    
    /**
     * Check if an animation is currently registered
     */
    isRegistered(id: string): boolean {
        return this.animations.has(id);
    }
    
    /**
     * Get the number of active animations
     */
    getActiveCount(): number {
        return this.animations.size;
    }
    
    private start(): void {
        if (this.isRunning) return;
        this.isRunning = true;
        this.lastFrameTime = performance.now();
        this.tick();
    }
    
    private stop(): void {
        this.isRunning = false;
        if (this.frameId !== null) {
            cancelAnimationFrame(this.frameId);
            this.frameId = null;
        }
    }
    
    private tick = (): void => {
        if (!this.isRunning) return;
        
        const now = performance.now();
        const deltaTime = now - this.lastFrameTime;
        
        // FPS limiting
        if (deltaTime < this.minFrameTime) {
            this.frameId = requestAnimationFrame(this.tick);
            return;
        }
        
        this.lastFrameTime = now;
        
        // Sort animations by priority (higher first)
        const sortedAnimations = Array.from(this.animations.values())
            .sort((a, b) => b.priority - a.priority);
        
        // Process animations
        const completedIds: string[] = [];
        
        for (const entry of sortedAnimations) {
            try {
                const isComplete = !entry.callback(now, deltaTime);
                if (isComplete) {
                    completedIds.push(entry.id);
                }
            } catch (error) {
                console.error(`[AnimationCoordinator] Error in animation ${entry.id}:`, error);
                completedIds.push(entry.id);
            }
        }
        
        // Remove completed animations
        for (const id of completedIds) {
            this.animations.delete(id);
        }
        
        // Continue loop if there are active animations
        if (this.animations.size > 0) {
            this.frameId = requestAnimationFrame(this.tick);
        } else {
            this.stop();
        }
    };
    
    /**
     * Stagger animation starts to prevent all gauges from animating at exact same time
     * Returns a delay in ms based on current animation count
     */
    getStaggerDelay(baseDelay: number = 0): number {
        const count = this.animations.size;
        // Stagger by 16ms (one frame) per active animation, up to 100ms max
        const stagger = Math.min(count * 16, 100);
        return baseDelay + stagger;
    }
}

// Export singleton instance
export const animationCoordinator = AnimationCoordinator.getInstance();

// Export utility functions
export const registerAnimation = (
    id: string, 
    callback: AnimationCallback, 
    priority?: number
): void => {
    animationCoordinator.register(id, callback, priority);
};

export const unregisterAnimation = (id: string): void => {
    animationCoordinator.unregister(id);
};

export const setGlobalAnimationFps = (fps: number): void => {
    animationCoordinator.setTargetFps(fps);
};

export const getAnimationStaggerDelay = (baseDelay: number = 0): number => {
    return animationCoordinator.getStaggerDelay(baseDelay);
};

export const isAnimationActive = (id: string): boolean => {
    return animationCoordinator.isRegistered(id);
};

export const getActiveAnimationCount = (): number => {
    return animationCoordinator.getActiveCount();
};
