import {generateSchemeRegexp} from "../utils/regExpParser";
import {
    bumpVersion,
    getCurVersion,
    getIntrabracketContent,
    getOptional,
    getVersionMap,
    versionMapToString
} from "../utils/utils";
import BumperOptionsFile from "../lib/types/OptionsFile.types";

describe("Retrieve 1st level interbracket content", () => {
    test("Simple input case: pre[intra content]post", () => {
        let testContent = "pre[intra content]post",
            intraContent = getIntrabracketContent(testContent);
        expect(intraContent).toStrictEqual(["intra content"]);
    });

    test("Diagonal input case: pre[intra1][intra2]post", () => {
        let testContent = "pre[intra1][intra2]post",
            intraContent = getIntrabracketContent(testContent);
        expect(intraContent).toStrictEqual(["intra1", "intra2"]);
    });

    test("Balanced bracket input: pre[intra1[intra2]]pos", () => {
        let testContent = "pre[intra1[intra2]]post",
            intraContent = getIntrabracketContent(testContent);
        expect(intraContent).toStrictEqual(["intra1[intra2]"]);
    });

    test("No bracket input: prepost", () => {
        let testContent = "prepost",
            intraContent = getIntrabracketContent(testContent);
        expect(intraContent).toBe(null);
    });

    test("Empty bracket input: prepost", () => {
        let testContent = "pre[]post",
            intraContent = getIntrabracketContent(testContent);
        expect(intraContent).toBe(null);
    });
});

describe("Generate Regular expression from scheme description", () => {
    describe("General semantic cases: major.minor.build", () => {
        let scheme = 'major.minor.build',
            genRegExp = generateSchemeRegexp(scheme);

        console.log(genRegExp);

        test("it should identify the correct item in the string for a simple input", () => {
            let match = "1.2.3".match(genRegExp);
            expect(match).not.toBe(null);
            expect(match!.length).toBe(1);
            expect(match![0]).toBe("1.2.3");
        });

        test("it should identify the correct item in the string for a complex input", () => {
            let match = "test1.2.3test".match(genRegExp);
            expect(match).not.toBe(null);
            expect(match!.length).toBe(1);
            expect(match![0]).toBe("1.2.3");
        });

        describe("It should reject: Incorrect inputs", () => {
            test("missing item -> 1.2", () => {
                let match = "1.2".match(genRegExp);
                expect(match).toBe(null);
                // expect(match.length).toBe(0);
            });

            test("misnamed item -> 1.two.3", () => {
                let match = "1.two.3".match(genRegExp);
                expect(match).toBe(null);
                // expect(match.length).toBe(0);
            });

            test("incorrect seperator -> 1.2-3", () => {
                let match = "1.2-3".match(genRegExp);
                expect(match).toBe(null);
                // expect(match.length).toBe(0);
            });

        });
    });
    describe("General semantic cases w/ optional tag: major.minor[.build]", () => {
        let scheme = 'major.minor[.build]',
            genRegExp = generateSchemeRegexp(scheme);

        test("it should identify the correct item in the string for simple input (w/ optional)", () => {
            let match = "1.2.3".match(genRegExp);
            expect(match).not.toBe(null);
            expect(match!.length).toBeGreaterThan(0);
            expect(match![0]).toBe("1.2.3");
        });

        test("it should identify the correct item in the string for simple input (w0/ optional)", () => {
            let match = "1.2".match(genRegExp);
            expect(match).not.toBe(null);
            expect(match!.length).toBeGreaterThan(0);
            expect(match![0]).toBe("1.2");
        });

        test("it should identify the correct item in the string for complex input (w/ optional)", () => {
            let match = "test.1.2.3.4".match(genRegExp);
            expect(match).not.toBe(null);
            expect(match!.length).toBeGreaterThan(0);
            expect(match![0]).toBe("1.2.3");
        });

        test("it should identify the correct item in the string for complex input (wo/ optional)", () => {
            let match = "test.1.2.test".match(genRegExp);
            expect(match).not.toBe(null);
            expect(match!.length).toBeGreaterThan(0);
            expect(match![0]).toBe("1.2");
        });

        describe("It should reject: Incorrect inputs", () => {
            test("missing item -> 1.", () => {
                let match = "1.".match(genRegExp);
                expect(match).toBe(null);
            });

            test("misnamed item -> 1.two.3", () => {
                let match = "1.two.3".match(genRegExp);
                expect(match).toBe(null);
                // expect(match.length).toBe(0);
            });

            test("incorrect seperator -> 1-2-3", () => {
                let match = "1-2-3".match(genRegExp);
                expect(match).toBe(null);
                // expect(match.length).toBe(0);
            });
        });
    });
    describe("General semantic cases w/ optional tags: major.minor[.build][.commit]", () => {
        let scheme = 'major.minor[.build][.commit]',
            genRegExp = generateSchemeRegexp(scheme);

        test("it should identify the correct item in the string for simple input (w/ optionals)", () => {
            let match = "1.2.3.4".match(genRegExp);
            expect(match).not.toBe(null);
            expect(match!.length).toBeGreaterThan(0);
            expect(match![0]).toBe("1.2.3.4");
        });

        test("it should identify the correct item in the string for simple input (wo/ optional)", () => {
            let match = "1.2.3".match(genRegExp);
            expect(match).not.toBe(null);
            expect(match!.length).toBeGreaterThan(0);
            expect(match![0]).toBe("1.2.3");
        });

        test("it should identify the correct item in the string for simple input (wo/ optionals)", () => {
            let match = "1.2".match(genRegExp);
            expect(match).not.toBe(null);
            expect(match!.length).toBeGreaterThan(0);
            expect(match![0]).toBe("1.2");
        });

        test("it should identify the correct item in the string for complex input (w/ optionals)", () => {
            let match = "test.1.2.3.4".match(genRegExp);
            expect(match).not.toBe(null);
            expect(match!.length).toBeGreaterThan(0);
            expect(match![0]).toBe("1.2.3.4");
        });

        test("it should identify the correct item in the string for complex input (wo/ optionals)", () => {
            let match = "test.1.2.test".match(genRegExp);
            expect(match).not.toBe(null);
            expect(match!.length).toBeGreaterThan(0);
            expect(match![0]).toBe("1.2");
        });

        describe("It should reject: Incorrect inputs", () => {
            test("missing item -> 1.", () => {
                let match = "1.".match(genRegExp);
                expect(match).toBe(null);
            });

            test("misnamed item -> 1.two.3", () => {
                let match = "1.two.3".match(genRegExp);
                expect(match).toBe(null);
                // expect(match.length).toBe(0);
            });

            test("incorrect seperator -> 1-2-3-4", () => {
                let match = "1-2-3-4".match(genRegExp);
                expect(match).toBe(null);
                // expect(match.length).toBe(0);
            });

            test("incorrect seperator -> 1-2-3", () => {
                let match = "1-2-3".match(genRegExp);
                expect(match).toBe(null);
                // expect(match.length).toBe(0);
            });
        });
    });
    describe("General semantic cases w/ compound optional tags: major.minor[.build[-commit]]", () => {
        let scheme = 'major.minor[.build[-commit]]',
            genRegExp = generateSchemeRegexp(scheme);

        test("it should identify the correct item in the string for simple input (w/ optionals)", () => {
            let match = "1.2.3-4".match(genRegExp);
            expect(match).not.toBe(null);
            expect(match!.length).toBeGreaterThan(0);
            expect(match![0]).toBe("1.2.3-4");
        });

        test("it should identify the correct item in the string for simple input (wo/ optional)", () => {
            let match = "1.2.3".match(genRegExp);
            expect(match).not.toBe(null);
            expect(match!.length).toBeGreaterThan(0);
            expect(match![0]).toBe("1.2.3");
        });

        test("it should identify the correct item in the string for simple input (wo/ optionals)", () => {
            let match = "1.2".match(genRegExp);
            expect(match).not.toBe(null);
            expect(match!.length).toBeGreaterThan(0);
            expect(match![0]).toBe("1.2");
        });

        test("it should identify the correct item in the string for complex input (w/ optionals)", () => {
            let match = "test.1.2.3-4".match(genRegExp);
            expect(match).not.toBe(null);
            expect(match!.length).toBeGreaterThan(0);
            expect(match![0]).toBe("1.2.3-4");
        });

        test("it should identify the correct item in the string for complex input (wo/ optionals)", () => {
            let match = "test.1.2.test".match(genRegExp);
            expect(match).not.toBe(null);
            expect(match!.length).toBeGreaterThan(0);
            expect(match![0]).toBe("1.2");
        });

        describe("It should reject: Incorrect inputs", () => {
            test("missing item -> 1.", () => {
                let match = "1.".match(genRegExp);
                expect(match).toBe(null);
            });

            test("misnamed item -> 1.two.3", () => {
                let match = "1.two.3".match(genRegExp);
                expect(match).toBe(null);
                // expect(match.length).toBe(0);
            });

            test("incorrect seperator -> 1-2-3-4", () => {
                let match = "1-2-3-4".match(genRegExp);
                expect(match).toBe(null);
                // expect(match.length).toBe(0);
            });

            test("incorrect seperator -> 1-2-3", () => {
                let match = "1-2-3".match(genRegExp);
                expect(match).toBe(null);
                // expect(match.length).toBe(0);
            });
        });
    });
    describe("Case with multiple seperators", () => {
        test("multiple seperators -> 1.2->3", () => {
            let match = "1.2->3".match(generateSchemeRegexp("major.minor->build"));
            expect(match).not.toBe(null);
            expect(match![0]).toBe("1.2->3");
        });

        test("multiple seperators with optional -> 1.2->3", () => {
            let match = "1.2->3".match(generateSchemeRegexp("major.minor[->build]"));
            expect(match).not.toBe(null);
            expect(match![0]).toBe("1.2->3");
        });

        test("multiple seperators with optionals -> 1.2->3<-4", () => {
            let match = "1.2->3<-4".match(generateSchemeRegexp("major.minor[->build][<-tag]"));
            expect(match).not.toBe(null);
            expect(match![0]).toBe("1.2->3<-4");
        });

        test("multiple seperators with compound optionals -> 1.2->3<-4", () => {
            let match = "1.2->3<-4".match(generateSchemeRegexp("major.minor[->build[<-tag]]"));
            expect(match).not.toBe(null);
            expect(match![0]).toBe("1.2->3<-4");
        });

    })
});

describe("Get Current version from files", () => {
    describe("Get Current version from package.json - semantic", () => {
        const VERSION = '3.2.1';
        let filePath = "./src/tests/assets/package-semantic-stub.json",
            options: BumperOptionsFile = {
                scheme: "semantic",
                versionFile: {path: filePath},
                files: [],
                rules: []
            };

        test("Get without line number", async () => {
            let curVer = await getCurVersion(options);
            expect(curVer).toBe(VERSION);
        });

        test("Get with line number", async () => {
            options.versionFile.line = 3;
            let curVer = await getCurVersion(options);
            expect(curVer).toBe(VERSION);
        });

        test("Get with incorrect line number", async () => {
            options.versionFile.line = 7;
            let curVer = await getCurVersion(options);
            expect(curVer).toBe(VERSION);
        });
    });


    test("Get version with multiple matched and line number", async () => {
        const VERSION = '3.2.1';
        let filePath = "./src/tests/assets/package-semantic-multiple-stub.json",
            options: BumperOptionsFile = {
                scheme: "semantic",
                versionFile: {path: filePath},
                files: [],
                rules: []
            };
        options.versionFile.line = 8;
        let curVer = await getCurVersion(options);
        expect(curVer).toBe(VERSION);
    });


    describe("Get Current version from packae.json - custom", () => {
        const VERSION = '3-2>1';
        let filePath = "./src/tests/assets/package-custom-stub.json",
            options: BumperOptionsFile = {
                scheme: "custom",
                schemeDefinition: "major-minor>build",
                versionFile: {path: filePath},
                files: [],
                rules: []
            };

        test("Get without line number", async () => {
            let curVer = await getCurVersion(options);
            expect(curVer).toBe(VERSION);
        });

        test("Get with line number", async () => {
            options.versionFile.line = 3;
            let curVer = await getCurVersion(options);
            expect(curVer).toBe(VERSION);
        });

        test("Get with incorrect line number", async () => {
            options.versionFile.line = 7;
            let curVer = await getCurVersion(options);
            expect(curVer).toBe(VERSION);
        });
    });

    test("Incorrect file path", async (done) => {
        let filePath = "./src/tests/assets/non-existent-file.txt",
            options: BumperOptionsFile = {
                scheme: "custom",
                schemeDefinition: "major-minor>build",
                versionFile: {path: filePath},
                files: [],
                rules: []
            };
        try {
            await getCurVersion(options);
            fail("Should return an error");
        } catch (e) {
            done();
        }
    });

    test("No match", async () => {
        let filePath = "./src/tests/assets/package-custom-stub.json",
            options: BumperOptionsFile = {
                scheme: "custom",
                schemeDefinition: "major.minor.build",
                versionFile: {path: filePath},
                files: [],
                rules: []
            };
        try {
            await getCurVersion(options);
            fail("Should return an error");
        } catch (e) {
            expect(e.message).toBe(`No match found in file. Unable to identify current version number.`);
        }
    });
});

describe("Get optional version items", () => {
    test("No Optional case.", () => {
        let optional = getOptional("major.minor.build");
        expect(optional).toStrictEqual({});
    });

    test("Single optional Case", () => {
        let optional = getOptional("major.minor[.build]");
        expect(optional).toStrictEqual({"build": ".build"});
    });

    test("Double optional case", () => {
        let optional = getOptional("major.minor[.build][.tag]");
        expect(optional).toStrictEqual({"build": ".build", "tag": ".tag"});
    });

    test("Double compound case", () => {
        let optional = getOptional("major.minor[.build[.tag]]");
        expect(optional).toStrictEqual({"build": ".build", "tag": ".tag"});

        // Fails -> TODO - Update getOptional to pass
        // optional = getOptional("major.minor[[.build].tag]");
        // expect(optional).toStrictEqual(["build","tag"]);
    });

    test("Multiple compound case", () => {
        let optional = getOptional("major.minor[.build[.tag][.other[.misc]]");
        expect(optional).toStrictEqual({"build": ".build", "tag": ".tag", "other": ".other", "misc": ".misc"});
    });

});

describe("Get Version Map tests", () => {

    test("Preset semantic", () => {
        let options: BumperOptionsFile = {
                scheme: "semantic",
                versionFile: {path: ""},
                files: [],
                rules: []
            },
            version = "1.2.3",
            map = getVersionMap(options, version);
        expect(map).toStrictEqual({
            major: 1,
            minor: 2,
            build: 3
        });

        version = "1.2";
        map = getVersionMap(options, version);
        expect(map).toStrictEqual({
            major: 1,
            minor: 2,
            build: 0
        });

    });

    test("No Optional Custom", () => {
        let options: BumperOptionsFile = {
                scheme: "custom",
                schemeDefinition: "version.patch->build",
                versionFile: {path: ""},
                files: [],
                rules: []
            },
            version = "1.2->3",
            map = getVersionMap(options, version);

        expect(map).toStrictEqual({
            version: 1,
            patch: 2,
            build: 3
        })
    });

    test("Single Optional Custom", () => {
        let options: BumperOptionsFile = {
                scheme: "custom",
                schemeDefinition: "version.patch[->build]",
                versionFile: {path: ""},
                files: [],
                rules: []
            },
            version = "1.2->3",
            map = getVersionMap(options, version);

        expect(map).toStrictEqual({
            version: 1,
            patch: 2,
            build: 3
        });

        version = "1.2";
        map = getVersionMap(options, version);

        expect(map).toStrictEqual({
            version: 1,
            patch: 2,
            build: 0
        });
    });

    test("Multiple Optional Custom", () => {
        let options: BumperOptionsFile = {
                scheme: "custom",
                schemeDefinition: "major[.minor][.build][->patch]",
                versionFile: {path: ""},
                files: [],
                rules: []
            },
            version = "1.2.3->4",
            map = getVersionMap(options, version);

        expect(map).toStrictEqual({
            major: 1,
            minor: 2,
            patch: 4,
            build: 3
        });

        version = "1.2";
        map = getVersionMap(options, version);

        expect(map).toStrictEqual({
            major: 1,
            minor: 2,
            patch: 0,
            build: 0
        });

        version = "1";
        map = getVersionMap(options, version);

        expect(map).toStrictEqual({
            major: 1,
            minor: 0,
            patch: 0,
            build: 0
        });
    });

});

describe("Version map to String tests", () => {
    let options: BumperOptionsFile = {
            scheme: "custom",
            schemeDefinition: "major.minor.build",
            versionFile: {path: ''},
            files: [],
            rules: []
        },
        map = {
            major: 2,
            minor: 1,
            build: 0
        };

    test("No optional", () => {
        let version: string = versionMapToString(options, map);
        expect(version).toBe("2.1.0");
    });

    test("Single Optional zero", () => {
        options.schemeDefinition = "major.minor[.build]";
        map = {
            major: 2,
            minor: 1,
            build: 0
        };
        let version: string = versionMapToString(options, map);
        expect(version).toBe("2.1");
    });

    test("Single Optional Value", () => {
        options.schemeDefinition = "major.minor[.build]";
        map = {
            major: 2,
            minor: 1,
            build: 34
        };
        let version: string = versionMapToString(options, map);
        expect(version).toBe("2.1.34");
    });

    test("Multiple Optional Value", () => {
        options.schemeDefinition = "major[.minor][.build]";
        map = {
            major: 2,
            minor: 1,
            build: 34
        };
        let version: string = versionMapToString(options, map);
        expect(version).toBe("2.1.34");

        options.schemeDefinition = "major[.minor[.build]]";
        version = versionMapToString(options, map);
        expect(version).toBe("2.1.34");
    });

    test("Multiple Optional Single Zero", () => {
        // minor = 0
        options.schemeDefinition = "major[.minor][.build]";
        map = {
            major: 2,
            minor: 0,
            build: 34
        };
        let version: string = versionMapToString(options, map);
        expect(version).toBe("2.0.34");

        options.schemeDefinition = "major[.minor[.build]]";
        version = versionMapToString(options, map);
        expect(version).toBe("2.0.34");

        // build = 0
        options.schemeDefinition = "major[.minor][.build]";
        map = {
            major: 2,
            minor: 1,
            build: 0
        };
        version = versionMapToString(options, map);
        expect(version).toBe("2.1");

        options.schemeDefinition = "major[.minor[.build]]";
        version = versionMapToString(options, map);
        expect(version).toBe("2.1");
    });

    test("Multiple Optional Multiple Zero", () => {
        options.schemeDefinition = "major[.minor][.build]";
        map = {
            major: 2,
            minor: 0,
            build: 0
        };
        let version: string = versionMapToString(options, map);
        expect(version).toBe("2");

        options.schemeDefinition = "major[.minor[.build]]";
        version = versionMapToString(options, map);
        expect(version).toBe("2");
    });

});

describe("Bump Version tests", () => {
    describe("Preset Semantic", () => {
        let options: BumperOptionsFile = {
            scheme: "semantic", // "major.minor[.build]
            versionFile: {path: './src/tests/assets/INTEGRATION_VERSION.txt', line: 1},
            files: [],
            rules: [
                // on any commit bump build
                {trigger: 'commit', bump: 'build'},
                // on any commit to branch master, bump minor and reset build
                {
                    trigger: 'commit',
                    branch: 'master',
                    bump: 'minor',
                    reset: 'build'
                },
                // on any commit to branch release, bump major and reset minor and build
                {
                    trigger: 'commit',
                    branch: 'release',
                    bump: 'major',
                    reset: ['minor', 'build']
                }
            ]
        };

        test("Commit Trigger random branch Tests", async () => {
            options.versionFile.line = 1; // should fetch version number 1.2.3
            // commit on random branch should result in just a bump from the build tag
            let newVersion: string = await bumpVersion(options, 'commit', 'random');
            expect(newVersion).toBe('1.2.4');
        });

        test("Commit Trigger random branch Tests no build", async () => {
            options.versionFile.line = 2; // should fetch version number 1.2.3
            // commit on random branch should result in just a bump from the build tag
            console.log(options);
            let newVersion: string = await bumpVersion(options, 'commit', 'random');
            expect(newVersion).toBe('1.2.1');
        });

        test("Commit Trigger release branch Tests", async () => {
            options.versionFile.line = 1; // should fetch version number 1.2.3
            // commit on random branch should result in just a bump from the build tag
            let newVersion: string = await bumpVersion(options, 'commit', 'release');
            expect(newVersion).toBe('2.0.1');
        });

        test("Commit Trigger release branch Tests no build", async () => {
            options.versionFile.line = 2; // should fetch version number 1.2.3
            // commit on random branch should result in just a bump from the build tag
            let newVersion: string = await bumpVersion(options, 'commit', 'release');
            expect(newVersion).toBe('2.0.1');
        });

        test("Commit Trigger master branch tests", async () => {
            options.versionFile.line = 1; // should fetch version number 1.2.3
            // commit on random branch should result in just a bump from the build tag
            let newVersion: string = await bumpVersion(options, 'commit', 'master');
            expect(newVersion).toBe('1.3.1');
        });

        test("Commit Trigger master branch tests no build", async () => {
            options.versionFile.line = 2; // should fetch version number 1.2.3
            // commit on random branch should result in just a bump from the build tag
            let newVersion: string = await bumpVersion(options, 'commit', 'master');
            expect(newVersion).toBe('1.3.1');
        });

        // describe("Pull-request trigger tests", () => {});
        // describe("Comment trigger", () => {});
    })
});
