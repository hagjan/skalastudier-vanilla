const std = @import("std");

pub fn build(b: *std.Build) void {
    const target = b.standardTargetOptions(.{ .default_target = .{ .cpu_arch = .wasm32, .os_tag = .freestanding } });

    const lib = b.addExecutable(.{
        .name = "synth",
        .root_source_file = b.path("root.zig"),
        .target = target,
        .optimize = .ReleaseSmall,
    });

    lib.entry = .disabled;
    lib.rdynamic = true;
    lib.import_symbols = true;

    b.installArtifact(lib);
}
