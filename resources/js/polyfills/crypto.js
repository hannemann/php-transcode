if (!typeof crypto !== "undefined" && !crypto.randomUUID) {
    console.log("initialize randomUUID polyfill");
    crypto.randomUUID = function () {
        return ([1e7] + -1e3 + -4e3 + -8e3 + -11e11).replace(/[018]/g, (c) =>
            (
                c ^
                (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
            ).toString(16),
        );
    };
}
