const std = @import("std");
const math = std.math;

pub const SampleRate = 44100;
pub const TwoPi = 2.0 * math.pi;
pub const VoiceLimit = 32;

extern fn print(a: u32) void;

var allocator = std.heap.wasm_allocator;

pub const ADSR = struct {
    attack_amplitude: f32 = 1.0,
    attack_time: f32 = 0.01,
    decay_time: f32 = 0.1,
    sustain_amplitude: f32 = 0.6,
    release_time: f32 = 0.2,

    trigger_on_time: f32 = 0,
    trigger_off_time: f32 = 0,

    state: enum { idle, attack, decay, sustain, release } = .idle,

    pub fn note_on(self: *ADSR, current_time: f32) void {
        self.state = .attack;
        self.trigger_on_time = current_time;
    }

    pub fn note_off(self: *ADSR, current_time: f32) void {
        self.state = .release;
        self.trigger_off_time = current_time;
    }

    pub fn process(self: *ADSR, current_time: f32) f32 {
        var amplitude: f32 = 0;
        var release_amplitude: f32 = 0;

        if (self.trigger_on_time > self.trigger_off_time) {
            const lifetime = current_time - self.trigger_on_time;

            if (lifetime <= self.attack_time) {
                amplitude = (lifetime / self.attack_time) * self.attack_amplitude;
            }

            if (lifetime > self.attack_time and lifetime <= (self.attack_time + self.decay_time)) {
                self.state = .decay;
                amplitude = ((lifetime - self.attack_time) / self.decay_time) * (self.sustain_amplitude - self.attack_amplitude) + self.attack_amplitude;
            }

            if (lifetime > (self.attack_time + self.decay_time)) {
                self.state = .sustain;
                amplitude = self.sustain_amplitude;
            }
        } else {
            const lifetime = self.trigger_off_time - self.trigger_on_time;
            if (lifetime >= self.attack_time) {
                release_amplitude = (lifetime / self.attack_time) * self.attack_amplitude;
            }

            if (lifetime > self.attack_time and lifetime <= self.attack_time + self.decay_time) {
                release_amplitude = ((lifetime - self.attack_time) / self.decay_time) * (self.sustain_amplitude - self.attack_amplitude) + self.attack_amplitude;
            }

            if (lifetime > (self.attack_time + self.decay_time)) {
                release_amplitude = self.sustain_amplitude;
            }

            amplitude = ((current_time - self.trigger_off_time) / self.release_time) * (0.0 - release_amplitude) + release_amplitude;
        }

        if (amplitude <= 0.0) {
            self.state = .idle;
            return 0.0;
        }

        return amplitude;
    }
};

pub const Voice = struct {
    phase: f32 = 0,
    frequency: f32 = 440,
    adsr: ADSR = ADSR{},
    sample_rate: f32 = SampleRate,
    scaling_factor: f32 = 1,

    pub fn note_on(self: *Voice, current_time: f32) void {
        self.adsr.note_on(current_time);
    }

    pub fn note_off(self: *Voice, current_time: f32) void {
        self.adsr.note_off(current_time);
    }

    pub fn render_sample(self: *Voice, current_time: f32) f32 {
        const amplitude = self.adsr.process(current_time) * self.scaling_factor;

        self.phase += TwoPi * self.frequency / self.sample_rate;
        if (self.phase > TwoPi) self.phase -= TwoPi;

        return amplitude * math.sin(self.phase);
    }
};

pub const Synth = struct {
    buffer: []f32,
    sample_rate: f32 = SampleRate,
    delta: f32 = 1 / SampleRate,
    voices: [VoiceLimit]Voice = undefined,
    time: f32 = 0,
    voice_count: u8 = 0,

    const Self = @This();

    pub fn note_on(self: *Self, frequency: f32) void {
        if (self.voice_count >= VoiceLimit) {
            return;
        }
        const scaling_factor = if (self.voice_count > 0) 1.0 / @sqrt(@as(f32, @floatFromInt(self.voice_count))) else 1;

        self.voices[self.voice_count] = Voice{
            .sample_rate = self.sample_rate,
            .frequency = frequency,
            .scaling_factor = scaling_factor,
        };
        self.voice_count += 1;

        self.voices[self.voice_count - 1].note_on(self.time);
    }

    pub fn note_off(self: *Self, frequency: f32) void {
        for (&self.voices) |*voice| {
            if (voice.frequency == frequency) {
                switch (voice.adsr.state) {
                    .attack, .decay, .sustain => {
                        voice.note_off(self.time + 0.00001);
                        break;
                    },
                    else => {},
                }
            }
        }
    }

    pub fn process(self: *Self, num_samples: usize) void {
        @memset(self.buffer[0..(self.buffer.len + 1)], 0);

        var i: usize = 0;
        while (i < self.voice_count) {
            const voice = &self.voices[i];
            if (voice.adsr.state == .idle) {
                self.voice_count -= 1;
                // remove voice by swapping with last voice
                if (i != self.voice_count) {
                    self.voices[i] = self.voices[self.voice_count];
                }
                // do not increment i, the swapped voice will be next
            } else {
                i += 1;
            }
        }

        for (0..num_samples) |n| {
            for (0..self.voice_count) |j| {
                const voice = &self.voices[j];
                self.buffer[n] += (voice.render_sample(self.time + 0.00001) * 0.3);
            }
            self.time += self.delta;
        }
    }
};

// Exported functions for WebAssembly interface

fn initSynthInternal(samplerate: f32) !usize {
    const buffer = try allocator.alloc(f32, 512);
    const s = try allocator.create(Synth);
    s.* = Synth{
        .buffer = buffer,
        .sample_rate = samplerate,
        .delta = 1 / samplerate,
    };
    synth = s;

    return @intFromPtr(buffer.ptr);
}

pub export fn initSynth(samplerate: f32) u32 {
    const result = initSynthInternal(samplerate) catch {
        return 1;
    };

    return result;
}

var synth: ?*Synth = null;

pub export fn noteOn(frequency: f32) void {
    if (synth) |s| {
        s.*.note_on(frequency);
    }
}

pub export fn noteOff(frequency: f32) void {
    if (synth) |s| {
        s.*.note_off(frequency);
    }
}

pub export fn allOff() void {
    if (synth) |s| {
        s.voice_count = 0;
    }
}

pub export fn process(num_samples: usize) usize {
    if (synth) |s| {
        s.*.process(num_samples);
    }

    return 0;
}
