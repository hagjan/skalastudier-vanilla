attack_amplitude: f32 = 1.0,
attack_time: f32 = 0.01,
decay_time: f32 = 0.03,
sustain_amplitude: f32 = 0.5,
release_time: f32 = 0.3,

trigger_on_time: f32 = 0,
trigger_off_time: f32 = 0,

state: enum { idle, attack, decay, sustain, release } = .idle,

const Self = @This();

pub fn note_on(self: *Self, current_time: f32) void {
    self.state = .attack;
    self.trigger_on_time = current_time;
}

pub fn note_off(self: *Self, current_time: f32) void {
    self.state = .release;
    self.trigger_off_time = current_time;
}

pub fn process(self: *Self, current_time: f32) f32 {
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
