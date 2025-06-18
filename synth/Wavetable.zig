const constants = @import("constants.zig");
const TwoPi = constants.TwoPi;
const Waveforms = @import("Waveforms.zig");
const Waveform = Waveforms.WaveForm;
const Oscillator = Waveforms.Oscillator;
const TABLE_SIZE = 4096;

sample_rate: f32,
wave_table: [TABLE_SIZE]f32 = [_]f32{0} ** TABLE_SIZE,

const Self = @This();
pub fn init(sample_rate: f32) Self {
    var instance = Self{
        .sample_rate = sample_rate,
    };
    const oscillator = Oscillator{ .waveform = Waveform.Sine };
    for (0..TABLE_SIZE) |i| {
        const phase: f32 = @as(f32, @floatFromInt(i)) / TABLE_SIZE;
        instance.wave_table[i] = oscillator.get_sample(phase, 1);
    }

    return instance;
}

pub fn set_waveform(self: *Self, waveform: Waveform) void {
    const oscillator = Oscillator{ .waveform = waveform };
    for (0..TABLE_SIZE) |i| {
        const phase: f32 = @as(f32, @floatFromInt(i)) / TABLE_SIZE;
        self.wave_table[i] = oscillator.get_sample(phase, 1);
    }
}

pub fn get_sample(self: *Self, phase: f32) f32 {
    const index = (phase / TwoPi) * TABLE_SIZE;
    return self.lerp(index);
}

fn lerp(self: *Self, index: f32) f32 {
    const truncated_index: usize = @intFromFloat(index);
    const next_index = (truncated_index + 1) % TABLE_SIZE;

    const next_index_weight = index - @as(f32, @floatFromInt(truncated_index));
    const truncated_index_weight = 1.0 - next_index_weight;

    return truncated_index_weight * self.wave_table[truncated_index] + next_index_weight * self.wave_table[next_index];
}
