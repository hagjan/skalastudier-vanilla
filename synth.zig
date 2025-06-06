const std = @import("std");
const math = std.math;

pub const SampleRate = 44100;
pub const TwoPi = 2.0 * math.pi;

pub const ADSR = struct {
    attack: f32,
    decay: f32,
    sustain: f32,
    release: f32,

    state: enum { idle, attack, decay, sustain, release } = .idle,
    time: f32 = 0,
    note_on_time: f32 = 0,
    note_off_time: f32 = 0,
    amplitude: f32 = 0,

    pub fn noteOn(self: *ADSR, current_time: f32) void {
        self.state = .attack;
        self.note_on_time = current_time;
        self.time = 0;
    }

    pub fn noteOff(self: *ADSR, current_time: f32) void {
        self.state = .release;
        self.note_off_time = current_time;
        self.time = 0;
    }

    pub fn process(self: *ADSR, dt: f32) f32 {
        self.time += dt;
        switch (self.state) {
            .idle => return 0,
            .attack => {
                self.amplitude = self.time / self.attack;
                if (self.time >= self.attack) {
                    self.state = .decay;
                    self.time = 0;
                }
                return @min(self.amplitude, 1.0);
            },
            .decay => {
                const decay_progress = self.time / self.decay;
                self.amplitude = 1.0 - decay_progress * (1.0 - self.sustain);
                if (self.time >= self.decay) {
                    self.state = .sustain;
                    self.amplitude = self.sustain;
                }
                return self.amplitude;
            },
            .sustain => return self.sustain,
            .release => {
                const release_progress = self.time / self.release;
                self.amplitude = self.sustain * (1.0 - release_progress);
                if (self.time >= self.release) {
                    self.state = .idle;
                    self.amplitude = 0;
                }
                return @max(self.amplitude, 0);
            },
        }
    }
};

pub const Synth = struct {
    phase: f32 = 0,
    frequency: f32 = 440,
    adsr: ADSR = ADSR{
        .attack = 0.1,
        .decay = 0.2,
        .sustain = 0.7,
        .release = 0.5,
        .state = .idle,
        .time = 0,
        .note_on_time = 0,
        .note_off_time = 0,
        .amplitude = 0,
    },
    sample_rate: f32 = SampleRate,
    playing: bool = false,
    trigger_start_time: f32 = 0,

    pub fn noteOn(self: *Synth, freq: f32, current_time: f32) void {
        self.frequency = freq;
        self.adsr.noteOn(current_time);
        self.playing = true;
        self.trigger_start_time = current_time;
    }

    pub fn noteOff(self: *Synth, current_time: f32) void {
        self.adsr.noteOff(current_time);
    }

    pub fn triggerNote(self: *Synth, freq: f32, current_time: f32) void {
        self.noteOn(freq, current_time);
        // The note will play for 3 seconds then noteOff will be called externally
    }

    pub fn renderSample(self: *Synth) f32 {
        if (!self.playing) return 0;

        const dt = 1.0 / self.sample_rate;
        const amplitude = self.adsr.process(dt);

        if (self.adsr.state == .idle) {
            self.playing = false;
            return 0;
        }

        self.phase += TwoPi * self.frequency / self.sample_rate;
        if (self.phase > TwoPi) self.phase -= TwoPi;

        return amplitude * math.sin(self.phase);
    }
};

// Exported functions for WebAssembly interface

var synth = Synth{};

pub export fn noteOn(freq: f32, current_time: f32) void {
    synth.noteOn(freq, current_time);
}

pub export fn noteOff(current_time: f32) void {
    synth.noteOff(current_time);
}

pub export fn triggerNote(freq: f32, current_time: f32) void {
    synth.triggerNote(freq, current_time);
}

pub export fn renderSample() f32 {
    return synth.renderSample();
}
