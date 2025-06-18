const std = @import("std");
const constants = @import("constants.zig");
const TwoPi = constants.TwoPi;

pub const WaveForm = enum { Sine, Triangle, Square };

pub const Oscillator = struct {
    waveform: WaveForm,

    const Self = @This();

    pub fn get_sample(self: *const Self, time: f32, frequency: f32) f32 {
        return switch (self.waveform) {
            .Sine => Sine.get_sample(time, frequency),
            .Triangle => Triangle.get_sample(time, frequency),
            .Square => Square.get_sample(time, frequency),
        };
    }
};

const Sine = struct {
    pub fn get_sample(time: f32, frequency: f32) f32 {
        return std.math.sin(frequency * TwoPi * time);
    }
};

const Triangle = struct {
    pub fn get_sample(time: f32, frequency: f32) f32 {
        const sine_sample = std.math.sin(frequency * TwoPi * time);
        return std.math.asin(sine_sample) * (2.0 / std.math.pi);
    }
};

const Square = struct {
    pub fn get_sample(time: f32, frequency: f32) f32 {
        if (std.math.sin(frequency * TwoPi * time) > 0) {
            return 1.0;
        } else {
            return 0.0;
        }
    }
};
