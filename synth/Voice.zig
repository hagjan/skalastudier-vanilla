const std = @import("std");
const ADSR = @import("ADSR.zig");
const WaveTable = @import("Wavetable.zig");
const constants = @import("constants.zig");
const SampleRate = constants.SampleRate;
const TwoPi = constants.TwoPi;

phase: f32 = 0,
frequency: f32 = 440,
adsr: ADSR = ADSR{},
sample_rate: f32 = SampleRate,
wave_table: *WaveTable,
scaling_factor: f32 = 1,

const Self = @This();

pub fn note_on(self: *Self, current_time: f32) void {
    self.adsr.note_on(current_time);
}

pub fn note_off(self: *Self, current_time: f32) void {
    self.adsr.note_off(current_time);
}

pub fn render_sample(self: *Self, current_time: f32) f32 {
    const amplitude = self.adsr.process(current_time) * self.scaling_factor;

    self.phase += TwoPi * self.frequency / self.sample_rate;
    if (self.phase > TwoPi) self.phase -= TwoPi;

    return amplitude * self.wave_table.get_sample(self.phase);
}
