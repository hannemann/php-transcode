class ConfiguratorHelper {
    get transcoder() {
        return document.querySelector('ffmpeg-transcoder');
    }

    get configurator() {
        return this.transcoder.shadowRoot.querySelector('transcode-configurator');
    }

    get clips() {
        return this.configurator.clips;
    }
}

export default new ConfiguratorHelper();