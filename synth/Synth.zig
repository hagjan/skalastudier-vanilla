const Voice = @import("Voice.zig");
const constants = @import("constants.zig");
const SampleRate = constants.SampleRate;
const VoiceLimit = constants.VoiceLimit;

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
