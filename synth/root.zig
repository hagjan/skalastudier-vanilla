const Synth = @import("Synth.zig");
const std = @import("std");
var allocator = std.heap.wasm_allocator;

extern fn print(a: u32) void;

// Exported functions for WebAssembly interface
var synth: ?Synth = null;

pub export fn init(samplerate: f32) u32 {
    const buffer = allocator.alloc(f32, 512) catch return 1;

    synth = Synth{
        .buffer = buffer,
        .sample_rate = samplerate,
        .delta = 1 / samplerate,
    };

    return @intFromPtr(buffer.ptr);
}

pub export fn noteOn(frequency: f32) void {
    if (synth) |*s| {
        s.note_on(frequency);
    }
}

pub export fn noteOff(frequency: f32) void {
    if (synth) |*s| {
        s.note_off(frequency);
    }
}

pub export fn allOff() void {
    if (synth) |*s| {
        s.voice_count = 0;
    }
}

pub export fn process(num_samples: usize) usize {
    if (synth) |*s| {
        s.process(num_samples);
    }

    return 0;
}
