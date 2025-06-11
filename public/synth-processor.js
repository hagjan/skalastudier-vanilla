class SynthProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super();
    this.sampleRate = sampleRate; // sampleRate is global in AudioWorkletProcessor
    this.ready = false;

    // Receive wasm bytes from main thread
    const wasmBytes = options.processorOptions.wasmBytes;

    // Instantiate WASM module synchronously here (WebAssembly.instantiateSync)
    WebAssembly.instantiate(wasmBytes, { env: { print: function(x) {console.log(x) }}  }).then(wasm => {
      this.wasmInstance = wasm.instance;
      this.exports = wasm.instance.exports;
      this.bufPtr = this.exports.initSynth(sampleRate)
      // Ready to process audio
    });

    this.port.onmessage = this.onmessage.bind(this);

    this.ready = true;
  }


  onmessage(event) {
    if (!this.ready) return;

    const data = event.data;
    if (data.type === 'noteOn') {
      // Call WASM noteOn(freq, current_time)
      this.exports.noteOn(data.frequency);
    } else if (data.type === 'noteOff') {
      this.exports.noteOff(data.frequency);
    } else if (data.type === 'allOff') {
      this.exports.allOff()
    }
  }

  process(_, outputList) {
    const outputSource = outputList[0];
    const outputChannel = outputSource[0];
    const numSamples = outputChannel.length;

    if (this.exports) {
      
      this.exports.process(numSamples);
      let bufferView = new Float32Array(this.exports.memory.buffer, this.bufPtr, numSamples);
      for (let i = 0; i < numSamples; i++) {
        outputChannel[i] = bufferView[i]

      }
    }

    return true;
  }
}


registerProcessor('synth-processor', SynthProcessor);

