const WaveTable = @import("Wavetable.zig");
const Waveforms = @import("Waveforms.zig");
const Waveform = Waveforms.WaveForm;
const Synth = @import("Synth.zig");
const std = @import("std");
var allocator = std.heap.wasm_allocator;

extern fn print(a: u32) void;

// Exported functions for WebAssembly interface
var synth: ?Synth = null;
var wave_table: ?WaveTable = null;

pub export fn init(samplerate: f32) u32 {
    const buffer = allocator.alloc(f32, 512) catch return 1;
    wave_table = WaveTable.init(samplerate);

    synth = Synth{
        .buffer = buffer,
        .sample_rate = samplerate,
        .delta = 1 / samplerate,
        .wave_table = &wave_table.?,
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

pub export fn setWaveform(wave: usize) void {
    if (wave_table) |*table| {
        switch (wave) {
            0 => table.set_waveform(Waveform.Sine),
            1 => table.set_waveform(Waveform.Triangle),
            2 => table.set_waveform(Waveform.Square),
            else => {},
        }
    }
}

pub export fn process(num_samples: usize) usize {
    if (synth) |*s| {
        s.process(num_samples);
    }

    return 0;
}
