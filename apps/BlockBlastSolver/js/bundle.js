(() => {
    (function (b) {
        const BOARD_SIZE = 9;
        const BS = BOARD_SIZE.toString();

        function P(e, t) {
            ne();
            let n = "";
            t.forEach((o, i) => {
                let a = ee(o);
                n += `Figure ${i + 1}: ${a.map(c => c.join("")).join("")} `
            }), console.log(n.trim());
            let l = z(e, t), s = K(l);
            if (s) {
                let o = j(s, e), i = j(Q(l), e);
                X(o, i);
                let a = o.placements.length, c = o.completedLines.length;
                console.log(`SolutionGrid:${o.finalGrid.flat().join(" ")}`), console.log(`CompletedLines:${o.completedLines.length}`), console.log(`placementsCount:${o.placements.length}`), document.getElementById("next-turn-message").classList.remove("hidden"), document.getElementById("next-turn-message").setAttribute("last-grid", o.finalGrid.flat().join(" "))
            } else {
                let o = J(e, t);
                o && o.placements.length > 0 ? (X(o), console.log(`PartialSolutionGrid:${o.finalGrid.flat().join(" ")}`), console.log(`CompletedLines:${o.completedLines.length}`), console.log(`placementsCount:${o.placements.length}`)) : (console.log("SolutionGrid:No solution found"), console.log("Solution:No solution found")), te()
            }
        }

        function z(e, t, n = [], l = [], s = []) {
            if (t.length === 0) return [{finalGrid: e, placements: n, completedLines: l, steps: s}];
            let o = [];
            for (let i = 0; i < t.length; i++) {
                let a = t[i], c = [...t.slice(0, i), ...t.slice(i + 1)];
                for (let d = 0; d < BOARD_SIZE; d++) for (let m = 0; m < BOARD_SIZE; m++) if (k(e, a, d, m)) {
                    let u = M(e, a, d, m), r = H(u), g = [...n, {placement: F(a, d, m), figure: a}], p = u;
                    r.forEach(f => {
                        if (f.type === "horizontal") p[f.index].fill(0); else if (f.type === "vertical") for (let x = 0; x < BOARD_SIZE; x++) p[x][f.index] = 0
                    });
                    let y = {grid: u, updatedGrid: p, placement: g[g.length - 1], completedLines: r},
                        h = z(p, c, g, [...l, ...r], [...s, y]);
                    o = o.concat(h)
                }
            }
            return o
        }

        function J(e, t, n = [], l = [], s = []) {
            let o = {finalGrid: e, placements: [], completedLines: [], steps: []};
            for (let i = 0; i < t.length; i++) {
                let a = t[i], c = !1;
                for (let d = 0; d < BOARD_SIZE && !c; d++) for (let m = 0; m < BOARD_SIZE && !c; m++) if (k(o.finalGrid, a, d, m)) {
                    let u = M(o.finalGrid, a, d, m), r = H(u), g = {placement: F(a, d, m), figure: a}, p = u;
                    r.forEach(h => {
                        if (h.type === "horizontal") p[h.index].fill(0); else if (h.type === "vertical") for (let f = 0; f < BOARD_SIZE; f++) p[f][h.index] = 0
                    });
                    let y = {grid: u, updatedGrid: p, placement: g, completedLines: r};
                    o.finalGrid = p, o.placements.push(g), o.completedLines = o.completedLines.concat(r), o.steps.push(y), c = !0
                }
            }
            return o
        }

        function K(e) {
            return e.length === 0 ? null : e.reduce((t, n) => {
                if (n.completedLines.length > t.completedLines.length) return n;
                if (n.completedLines.length === t.completedLines.length) {
                    if (n.placements.length < t.placements.length) return n;
                    if (n.placements.length === t.placements.length) {
                        let l = n.steps.findIndex(o => o.completedLines.length > 0),
                            s = t.steps.findIndex(o => o.completedLines.length > 0);
                        return l < s ? n : t
                    }
                }
                return t
            })
        }

        function Q(e) {
            return e.length === 0 ? null : e.reduce((t, n) => {
                let l = n.steps.findIndex(o => o.completedLines.length > 0),
                    s = t ? t.steps.findIndex(o => o.completedLines.length > 0) : -1;
                return l === -1 ? t : !t || l < s ? n : l > s ? t : n.completedLines.length > t.completedLines.length ? n : t
            }, null)
        }

        function j(e, t) {
            if (!e) return null;
            if (e.steps.length === 0) return e;
            let n = e.steps[e.steps.length - 1];
            if (n.completedLines.length > 0) return e;
            let l = n.placement.figure, s = e.steps[e.steps.length - 2]?.updatedGrid || t, o = null, i = 1 / 0;
            for (let a = 0; a < BOARD_SIZE; a++) for (let c = 0; c < BOARD_SIZE; c++) if (k(s, l, a, c)) {
                let d = Math.sqrt(Math.pow(a - 3.5, 2) + Math.pow(c - 3.5, 2));
                d < i && (i = d, o = {row: a, col: c})
            }
            if (o) {
                let a = M(s, l, o.row, o.col), c = {placement: F(l, o.row, o.col), figure: l};
                e.steps[e.steps.length - 1] = {
                    ...n,
                    grid: a,
                    updatedGrid: a,
                    placement: c
                }, e.finalGrid = a, e.placements[e.placements.length - 1] = c
            }
            return e
        }

        function ee(e) {
            let t = Array(5).fill().map(() => Array(5).fill(0));
            for (let n = 0; n < e.length; n++) for (let l = 0; l < e[n].length; l++) t[n][l] = e[n][l];
            return t
        }

        function k(e, t, n, l) {
            for (let s = 0; s < t.length; s++) for (let o = 0; o < t[0].length; o++) if (t[s][o] === 1 && (n + s >= BOARD_SIZE || l + o >= BOARD_SIZE || e[n + s][l + o] !== 0)) return !1;
            return !0
        }

        function M(e, t, n, l) {
            let s = e.map(o => [...o]);
            for (let o = 0; o < t.length; o++) for (let i = 0; i < t[0].length; i++) t[o][i] === 1 && (s[n + o][l + i] = 1);
            return s
        }

        function F(e, t, n) {
            let l = [];
            for (let s = 0; s < e.length; s++) for (let o = 0; o < e[0].length; o++) e[s][o] === 1 && l.push([t + s, n + o]);
            return l
        }

        function H(e) {
            let t = [];
            for (let n = 0; n < BOARD_SIZE; n++) e[n].every(l => l === 1) && t.push({type: "horizontal", index: n});
            for (let n = 0; n < BOARD_SIZE; n++) e.every(l => l[n] === 1) && t.push({type: "vertical", index: n});
            return t
        }

        function X(e, t) {
            let n = document.getElementById("steps-container"), l = document.getElementById("steps-list"),
                s = document.createElement("div"), o = document.createElement("div");
            n.classList.remove("hidden"), l.innerHTML = "";
            let i = t && JSON.stringify(e) !== JSON.stringify(t);
            s.className = "flex mb-4 justify-center";
            let a = document.createElement("button");
            a.className = "px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600", i && (a.className = "px-4 py-2 bg-blue-500 text-white rounded-l hover:bg-blue-600"), a.textContent = `Best (${e.completedLines.length} lines)`, s.appendChild(a);
            let c = document.createElement("div"), d = document.createElement("div");
            if (d.className = "hidden", o.appendChild(c), i ? t && (console.log(`EarliestSolutionGrid:${t.finalGrid.flat().join(" ")}`), console.log(`EarliestCompletedLines:${t.completedLines.length}`)) : (console.log("EarliestSolutionGrid:null"), console.log("EarliestCompletedLines:null")), i) {
                let u = document.createElement("button");
                u.className = "px-4 py-2 bg-gray-300 text-gray-700 rounded-r hover:bg-gray-400", u.textContent = `Keep combo! (${t.completedLines.length} lines)`, s.appendChild(u), o.appendChild(d), a.onclick = () => {
                    a.className = "px-4 py-2 bg-blue-500 text-white rounded-l hover:bg-blue-600", u.className = "px-4 py-2 bg-gray-300 text-gray-700 rounded-r hover:bg-gray-400", c.classList.remove("hidden"), d.classList.add("hidden"), document.getElementById("next-turn-message").setAttribute("last-grid", e.finalGrid.flat().join(" "))
                }, u.onclick = () => {
                    u.className = "px-4 py-2 bg-blue-500 text-white rounded-r hover:bg-blue-600", a.className = "px-4 py-2 bg-gray-300 text-gray-700 rounded-l hover:bg-gray-400", d.classList.remove("hidden"), c.classList.add("hidden"), document.getElementById("next-turn-message").setAttribute("last-grid", t.finalGrid.flat().join(" "))
                }
            }
            l.appendChild(s), l.appendChild(o);
            let m = (u, r) => {
                u.steps.forEach((y, h) => {
                    let f = document.createElement("div");
                    f.className = "p-4 mb-4", f.innerHTML = `<h3 class="font-bold mb-2">Step ${h + 1}</h3>`;
                    let x = document.createElement("div");
                    x.className = "grid grid-cols-" + BS + " gap-1 sm:gap-2 mb-4";
                    for (let v = 0; v < BOARD_SIZE; v++) for (let E = 0; E < BOARD_SIZE; E++) {
                        let w = document.createElement("div");
                        if (y.grid[v][E] === 0 && !y.placement.placement.some(([I, A]) => I === v && A === E)) w.className = "w-6 h-6 sm:w-" + BS + " sm:h-" + BS + " bg-green-500"; else {
                            let I = y.placement.placement.some(([A, Ae]) => A === v && Ae === E);
                            w.className = `w-6 h-6 sm:w-${BS} sm:h-${BS} ${I ? "bg-blue-500" : "bg-red-500"}`
                        }
                        y.completedLines.forEach(I => {
                            (I.type === "horizontal" && v === I.index || I.type === "vertical" && E === I.index) && w.classList.add("border-4", "border-purple-500")
                        }), x.appendChild(w)
                    }
                    f.appendChild(x);
                    let L = document.createElement("div");
                    L.innerHTML = `
                <p class="font-bold">Completed lines: ${y.completedLines.length}</p>
            `, f.appendChild(L), r.appendChild(f)
                });
                let g = u.completedLines.length, p = document.createElement("div");
                p.className = "mt-4 p-4 bg-gray-100 rounded", p.innerHTML = `<p class="font-bold text-lg">Total lines completed: ${g}</p>`, r.appendChild(p)
            };
            m(e, c), i && m(t, d)
        }

        function te() {
            document.getElementById("cooked-message").classList.remove("hidden")
        }

        function ne() {
            oe(), document.getElementById("steps-container").classList.add("hidden"), document.getElementById("steps-list").innerHTML = "";
            let t = document.getElementById("result-container");
            t && (t.textContent = "", t.classList.add("hidden")), document.getElementById("next-turn-message").classList.add("hidden"), document.getElementById("cooked-message").classList.add("hidden")
        }

        function oe() {
            let e = document.getElementById("solution-grid");
            e.innerHTML = "";
            for (let t = 0; t < BOARD_SIZE * BOARD_SIZE; t++) {
                let n = document.createElement("div");
                n.className = "w-6 h-6 sm:w-" + BS + " sm:h-" + BS + " bg-green-500", e.appendChild(n)
            }
        }

        function se() {
            return ["iPad Simulator", "iPhone Simulator", "iPod Simulator", "iPad", "iPhone", "iPod"].includes(navigator.platform) || navigator.userAgent.includes("Mac") && "ontouchend" in document
        }

        function le() {
            return navigator.userAgent.toLowerCase().includes("android")
        }

        function Pe() {
            return Intl.DateTimeFormat().resolvedOptions().timeZone === "Asia/Manila"
        }

        function ze() {
            let e = Intl.DateTimeFormat().resolvedOptions().timeZone;
            return console.log("Timezone: ", e), e === "Europe/Amsterdam"
        }

        function O() {

            var e = n;

            function t() {
                var d = ["2355lNUJzk", "location", "9328ljLjpw", "10IQwUxA", "18328AkPlzV", "localhost", "blockblastsolver.com", "171VCsmfn", "20802TKkOTu", "562980sTxvuF", "includes", "931KIZZAb", "69845eVtwwF", "10968LhXYTp", "https://blockblastsolver.com", "4774938SoBRcn", "hostname", "6188104sLuXzx", "href"];
                return t = function () {
                    return d
                }, t()
            }

            (function (d, m) {
                for (var u = n, r = d(); ;) try {
                    var g = parseInt(u(279)) / 1 * (parseInt(u(270)) / 2) + -parseInt(u(263)) / 3 + parseInt(u(265)) / 4 + parseInt(u(267)) / 5 * (-parseInt(u(275)) / 6) + -parseInt(u(278)) / 7 * (-parseInt(u(271)) / 8) + -parseInt(u(274)) / 9 * (-parseInt(u(276)) / 10) + parseInt(u(269)) / 11 * (parseInt(u(280)) / 12);
                    if (g === m) break;
                    r.push(r.shift())
                } catch {
                    r.push(r.shift())
                }
            })(t, 821085);

            function n(d, m) {
                var u = t();
                return n = function (r, g) {
                    r = r - 263;
                    var p = u[r];
                    return p
                }, n(d, m)
            }

            if (![e(273), e(272)][e(277)](b[e(268)][e(264)])) {
                b[e(268)][e(266)] = e(281);
                return
            }
            if (document.getElementById("dropzone-file").addEventListener("change", R), document.getElementById("upload-another-screenshot").addEventListener("change", function (d) {
                document.getElementById("dropzone-file-container").scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                }), R(d)
            }), document.getElementById("manual-input-button").addEventListener("click", function () {
                document.getElementById("manual-input-sections").classList.remove("hidden"), D(), Se(), document.getElementById("manual-input-container").scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
                let u = document.getElementById("next-turn-message").getAttribute("last-grid");
                console.log("Last grid: ", u);
                let r = u.split(" ");
                if (r.length == BOARD_SIZE * BOARD_SIZE) for (let g = 0; g < BOARD_SIZE * BOARD_SIZE; g++) {
                    let p = document.querySelector(`[data-cell-id="grid-cell-${g}"]`);
                    p && r[g] == "1" && Te(p)
                }
            }), document.getElementById("example-image").addEventListener("click", Be), document.getElementById("use-website-link").addEventListener("click", function () {
                b.plausible && b.plausible("use_website"), document.getElementById("dropzone-file-container").classList.remove("hidden"), document.getElementById("manual-input-container").classList.remove("hidden"), document.getElementById("use-website").classList.add("hidden"), document.getElementById("app-link").classList.add("hidden"), document.getElementById("app-link-continue").classList.remove("hidden"), document.getElementById("app-second-link").classList.remove("hidden")
            }), !se()) document.getElementById("dropzone-file-container").classList.remove("hidden"), document.getElementById("manual-input-container").classList.remove("hidden"), document.getElementById("use-website").classList.add("hidden"), document.getElementById("app-link").classList.add("hidden"), document.getElementById("app-link-continue").classList.add("hidden"), document.getElementById("infinite-aura-web-container").classList.remove("hidden"); else {
                document.getElementById("dropzone-file-container").classList.add("hidden"), document.getElementById("manual-input-container").classList.add("hidden"), document.getElementById("use-website").classList.remove("hidden"), document.getElementById("app-link").classList.remove("hidden"), document.getElementById("app-link-continue").classList.remove("hidden"), document.getElementById("competitive-block-container").classList.remove("hidden");
                let d = Intl.DateTimeFormat().resolvedOptions().timeZone
            }
            let c = Intl.DateTimeFormat().resolvedOptions().timeZone;
            document.getElementById("fuelviral-container").classList.remove("hidden"), le(), Me()
        }

        function R(e) {
            let t = e.target.files[0];
            if (!t) return;
            document.getElementById("upload-spinner").classList.remove("hidden"), document.getElementById("actual-button-to-upload").classList.add("hidden"), document.getElementById("manual-input-sections").classList.add("hidden");
            let n = new FileReader;
            n.onload = l => {
                let s = l.target.result, o = Math.random() * 1500 + 500;
                setTimeout(() => {
                    ie(s), document.getElementById("actual-button-to-upload").classList.remove("hidden"), document.getElementById("upload-spinner").classList.add("hidden")
                }, o)
            }, n.readAsDataURL(t), console.log("Outputing to console"), b.plausible && b.plausible("solve_attempt"), e.target.value = ""
        }

        function je(e, t) {
            fetch(e).then(n => n.blob()).then(n => {
                let l = new FormData;
                l.append("file", n, "screenshot.png"), l.append("text", t), fetch("https://blockblastsolver.fly.dev/upload", {
                    method: "POST",
                    body: l
                }).then(s => s.json()).then(s => {
                    console.log("Feedback sent successfully:", s)
                }).catch(s => {
                    console.error("Error sending feedback:", s)
                })
            })
        }

        function ie(e) {
            let t = new Image;
            t.onload = () => {
                try {
                    D();
                    let n = ce(t);
                    console.log(`Canvas width: ${n.width}, height: ${n.height}`);
                    let l = re(n), s = ue(n), o = me(s), i = (n.width - s.width) / 2, a = be(n, l, i);
                    P(o, a), $() && Le(n, s), _(), Y()
                } catch (n) {
                    console.error("Error processing image:", n);
                    let l = document.getElementById("result-container");
                    l.textContent = "An error occurred while processing the image. Please try again.", l.classList.remove("hidden")
                } finally {
                    S(), T(e)
                }
            }, t.src = e
        }

        function T(e) {
            let t = document.getElementById("report-issue");
            t.classList.remove("hidden"), t.onclick = () => ke(e)
        }

        function Y() {
            S(), setTimeout(() => {
                document.getElementById("grid-container").scrollIntoView({behavior: "smooth", block: "start"})
            }, 200), T("null")
        }

        function _() {
            document.getElementById("example-image").closest(".bg-white").classList.add("hidden")
        }

        function B(e) {
            return e.width / e.height > .5
        }

        function S() {
            if (!document.getElementById("feedback-container")) {
                let l = document.createElement("div");
                l.id = "feedback-container", l.className = "mt-4 flex flex-col items-center space-y-4 bg-white p-" + BS + " rounded-lg shadow-md", l.innerHTML = `
            <div>
                            <p class="text-lg font-medium mb-4">What do you think about the solver?</p>
            <div class="flex justify-center space-x-4 mt-4">
                <button id="upvote-button" class="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out">
                    \u{1F44D} I like it!
                </button>
                <button id="downvote-button" class="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out">
                    \u{1F44E} Sucks!
                </button>
            </div>
                <div id="feedback-text-container" class="hidden w-full items-center mt-2 text-center">
                    <textarea id="feedback-text" class="w-full p-2 border rounded" rows="3" placeholder="Please provide your feedback"></textarea>
                    <button id="report-issue" class="mt-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out" disabled>
                        Report an issue
                    </button>
                    <button id="close-report" class="mt-2 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out">
                        Cancel
                    </button>
                </div>
            </div>
        `;
                let s = document.getElementById("report-issue");
                s.parentNode.insertBefore(l, s);
                let o = document.getElementById("upvote-button"), i = document.getElementById("downvote-button"),
                    a = document.getElementById("feedback-text"), c = document.getElementById("report-issue"),
                    d = document.getElementById("close-report");
                o.addEventListener("click", ae), i.addEventListener("click", de), a.addEventListener("input", () => {
                    c.disabled = a.value.length < 3
                }), d.addEventListener("click", function () {
                    l.remove(), S(), T("null")
                })
            }
            let t = document.getElementById("upvote-button"), n = document.getElementById("downvote-button");
            t.disabled = !1, n.disabled = !1, t.classList.remove("opacity-50", "cursor-not-allowed"), n.classList.remove("opacity-50", "cursor-not-allowed")
        }

        function ae() {
            b.plausible && b.plausible("upvote"), U()
        }

        function de() {
            document.getElementById("feedback-text-container").classList.remove("hidden"), U()
        }

        function U() {
            let e = document.getElementById("upvote-button"), t = document.getElementById("downvote-button");
            e.disabled = !0, t.disabled = !0, e.classList.add("opacity-50", "cursor-not-allowed"), t.classList.add("opacity-50", "cursor-not-allowed")
        }

        function D() {
            let e = document.getElementById("solution-container"), t = document.getElementById("solution-grid");
            e.classList.add("hidden"), t.innerHTML = "";
            let n = document.getElementById("steps-container"), l = document.getElementById("steps-list");
            n.classList.add("hidden"), l.innerHTML = "";
            let s = document.getElementById("result-container");
            s && (s.textContent = "", s.classList.add("hidden"));
            let o = document.getElementById("feedback-container");
            o && o.remove()
        }

        function ce(e) {
            let t = document.createElement("canvas"), n = t.getContext("2d");
            return t.width = e.width, t.height = e.height, n.drawImage(e, 0, 0, e.width, e.height), t
        }

        function re(e) {
            return e.getContext("2d").getImageData(0, 0, e.width, e.height)
        }

        function ue(e) {
            let t, n;
            console.log("Is tablet?: ", B(e)), B(e) ? (t = Math.floor(e.height * .1785), n = Math.floor(e.height * .6779)) : (t = Math.floor(e.height * .2375), n = Math.floor(e.height * .65));
            let l = n - t, s = l, o = Math.floor((e.width - s) / 2);
            return C(e, o, t, s, l)
        }

        function V(e, t, n, l) {
            return e.every((s, o) => Math.abs(s - t[o]) <= n)
        }

        function C(e, t, n, l, s) {
            let o = document.createElement("canvas"), i = o.getContext("2d");
            return o.width = l, o.height = s, i.drawImage(e, t, n, l, s, 0, 0, l, s), o
        }

        function me(e) {
            let t = document.getElementById("grid-container"), n = document.getElementById("grid-tiles"), l = BOARD_SIZE,
                s = e.width - 2 * l, o = e.height - 2 * l, i = Math.floor(s / BOARD_SIZE), a = Math.floor(o / BOARD_SIZE),
                c = [28, 36, 70], d = [141, 96, 209], m = 50;
            n.innerHTML = "";
            let u = [];
            for (let r = 0; r < BOARD_SIZE; r++) {
                let g = [];
                for (let p = 0; p < BOARD_SIZE; p++) {
                    let y = ge(e, r, p, l, i, a), h = pe(y), f = he(h, c, d);
                    g.push(f ? 0 : 1), fe(n, f, r, p)
                }
                u.push(g)
            }
            return t.classList.remove("hidden"), console.log(`InitialGrid:${u.flat().join(" ")}`), u
        }

        function ge(e, t, n, l, s, o) {
            let i = l + n * s, a = l + t * o, c = document.createElement("canvas"), d = c.getContext("2d");
            return c.width = s, c.height = o, d.drawImage(e, i, a, s, o, 0, 0, s, o), c
        }

        function pe(e) {
            let t = e.getContext("2d"), n = Math.floor(e.width / 2), l = Math.floor(e.height / 2),
                s = t.getImageData(n, l, 1, 1).data;
            return [s[0], s[1], s[2]]
        }

        function he(e, t, n) {
            let l = q(e, t), s = q(e, n);
            return l < s / 2
        }

        function q(e, t) {
            return Math.sqrt(Math.pow(e[0] - t[0], 2) + Math.pow(e[1] - t[1], 2) + Math.pow(e[2] - t[2], 2))
        }

        function fe(e, t, n, l) {
            let s = document.createElement("div");
            s.className = `w-6 h-6 sm:w- sm:h-" + BS + " ${t ? "bg-green-500" : "bg-red-500"}`, s.title = `Row ${n + 1}, Column ${l + 1}: ${t ? "Empty" : "Filled"}`, e.appendChild(s)
        }

        function be(e, t, n) {
            let l = document.getElementById("figures-container"), s = document.getElementById("figures-grid"), o, i;
            B(e) ? (o = Math.floor(e.height * .6779) + 80, i = Math.floor(e.height * .93) - 60) : (o = Math.floor(e.height * 2 / 3) + 50, i = Math.floor(e.height * 5 / 6));
            let a = n, c = e.width - n;
            console.log(`For figure splitting startX: ${a}, startY: ${o}, endX: ${c}, endY: ${i}`);
            let d = C(e, a, o, c - a, i - o);
            $() && we(d), console.log(`For figure splitting width: ${d.width}, height: ${d.height}`);
            let m = Math.floor(d.width / 3),
                u = [{startX: 0, endX: m}, {startX: m, endX: m * 2}, {startX: m * 2, endX: d.width}],
                r = ye(d, u, s, e);
            return l.classList.remove("hidden"), r
        }

        function ye(e, t, n, l) {
            n.innerHTML = "";
            let s = [], o = ["blue", "yellow", "fuchsia"];
            return xe(e, t).forEach((a, c) => {
                let d = Ie(a.subcroppedFigure, l), m = W(d);
                if (s.push(m), ve(n, m, c, o[c]), $()) {
                    let u = document.createElement("img");
                    u.src = a.subcroppedFigure.toDataURL(), u.alt = `Debug Figure ${c + 1}`, u.className = "max-w-full h-auto mt-2", n.appendChild(u);
                    let r = document.createElement("canvas");
                    r.width = a.subcroppedFigure.width, r.height = a.subcroppedFigure.height;
                    let g = r.getContext("2d");
                    g.drawImage(a.subcroppedFigure, 0, 0), g.strokeStyle = "rgba(255, 0, 0, 0.5)", g.lineWidth = 1;
                    let p = Math.min(r.width, r.height) / Math.max(m.length, m[0].length);
                    for (let h = 0; h <= m.length; h++) g.beginPath(), g.moveTo(0, h * p), g.lineTo(r.width, h * p), g.stroke();
                    for (let h = 0; h <= m[0].length; h++) g.beginPath(), g.moveTo(h * p, 0), g.lineTo(h * p, r.height), g.stroke();
                    g.fillStyle = "rgba(0, 255, 0, 0.3)";
                    for (let h = 0; h < m.length; h++) for (let f = 0; f < m[h].length; f++) m[h][f] === 1 && g.fillRect(f * p, h * p, p, p);
                    let y = document.createElement("img");
                    y.src = r.toDataURL(), y.alt = `Debug Visual Figure ${c + 1}`, y.className = "max-w-full h-auto mt-2", n.appendChild(y)
                }
            }), s
        }

        function W(e) {
            e = e.filter(n => n.some(l => l !== 0));
            let t = e[0].map((n, l) => e.some(s => s[l] !== 0));
            return e = e.map(n => n.filter((l, s) => t[s])), e
        }

        function xe(e, t) {
            return t.map(n => {
                let l = C(e, n.startX, 0, n.endX - n.startX, e.height), s = Ee(l), o = s.getContext("2d"),
                    i = Math.floor(s.width / 2), a = Math.floor(s.height / 2), c = o.getImageData(i, a, 1, 1).data,
                    d = c[0] < 10 && c[1] < 10 && c[2] < 10;
                return {subcroppedFigure: s, isValid: !d}
            }).filter(n => n.isValid)
        }

        function ve(e, t, n, l) {
            let s = document.createElement("div");
            s.className = "flex flex-col items-center mb-" + BS, s.innerHTML = `
        <h3 class="text-lg font-semibold mb-2">Figure ${n + 1}</h3>
        <div class="grid" style="grid-template-columns: repeat(${t[0].length}, 1fr);">
            ${t.flat().map(o => `
                <div class="w-${BS} h-${BS} ${o ? `bg-${l}-500` : "bg-white"} border border-white"></div>
            `).join("")}
        </div>
    `, e.appendChild(s)
        }

        function Ee(e) {
            let l = e.getContext("2d").getImageData(0, 0, e.width, e.height).data, s = [49, 72, 131], o = 60,
                i = e.width, a = e.height, c = 0, d = 0;
            console.log(`startXwidth: ${i}, startYheight: ${a}`);
            for (let u = 0; u < e.height; u++) for (let r = 0; r < e.width; r++) {
                let g = (u * e.width + r) * 4, [p, y, h] = [l[g], l[g + 1], l[g + 2]];
                V([p, y, h], s, o) || (i = Math.min(i, r), a = Math.min(a, u), c = Math.max(c, r), d = Math.max(d, u))
            }
            let m = 5;
            return i = Math.max(0, i - m), a = Math.max(0, a - m), c = Math.min(e.width, c + m), d = Math.min(e.height, d + m), console.log(`subcroppedFigure startX: ${i}, startY: ${a}, endX: ${c}, endY: ${d}`), C(e, i, a, c - i, d - a)
        }

        function Ie(e, t) {
            let s = e.getContext("2d").getImageData(0, 0, e.width, e.height).data, o = [49, 72, 131], i;
            B(t) ? i = 30 : i = 40, console.log(t.width, t.height);
            let a = Math.floor(t.height * .0007153075823), c = Math.floor(t.height * .0003949447077), d;
            B(t) ? d = Math.floor(t.height * .02567095851) : d = Math.floor(t.height * .02067095851);
            let m = d + c, u = Math.floor((e.width - 2 * a + c) / m), r = Math.floor((e.height - 2 * a + c) / m),
                g = [];
            console.log("cols", u), console.log("rows", r);
            for (let p = 0; p < r; p++) {
                let y = [];
                for (let h = 0; h < u; h++) {
                    let f = a + h * m + Math.floor(d / 1.1),
                        L = ((a + p * m + Math.floor(d / 1.1)) * e.width + f) * 4, [v, E, w] = [s[L], s[L + 1], s[L + 2]];
                    V([v, E, w], o, i, !0) ? y.push(0) : y.push(1)
                }
                g.push(y)
            }
            return g
        }

        function $() {
            let e = new URLSearchParams(b.location.search);
            return e.get("debug") === "true" && console.log("---- DEBUG MODE ----   "), e.get("debug") === "true"
        }

        function Le(e, t, n) {
            let l = document.getElementById("debug-container");
            if (!l) {
                let s = document.createElement("div");
                s.id = "debug-container", s.className = `mt-${BS} p-4 bg-white rounded-lg shadow-md`, document.body.appendChild(s)
            }
            l.innerHTML = `
        <h2 class="text-xl font-bold mb-4">Debug Information</h2>
        <div class="flex flex-col space-y-4">
            <div>
                <h3 class="text-lg font-semibold mb-2">Full Image</h3>
                <img src="${e.toDataURL()}" alt="Full Image" class="max-w-full h-auto">
            </div>
            <div>
                <h3 class="text-lg font-semibold mb-2">Cropped Grid</h3>
                <img src="${t.toDataURL()}" alt="Cropped Grid" class="max-w-full h-auto">
            </div>
        </div>
    `, l.classList.remove("hidden")
        }

        function we(e) {
            let t = document.getElementById("figures-debug-container");
            if (!t) {
                let n = document.createElement("div");
                n.id = "figures-debug-container", n.className = `mt-${BS} p-4 bg-white rounded-lg shadow-md`, document.body.appendChild(n)
            }
            t.innerHTML = `
        <h2 class="text-xl font-bold mb-4">Debug Information</h2>
        <div class="flex flex-col space-y-4">
            <div>
                <h3 class="text-lg font-semibold mb-2">Figures Cropped</h3>
                <img src="${e.toDataURL()}" alt="Full Image" class="max-w-full h-auto">
            </div>
        </div>
    `, t.classList.remove("hidden")
        }

        function Be() {
            b.plausible && b.plausible("example_attempt"), Ce("samples/1x4.PNG", function () {
                let e = document.createElement("canvas");
                e.width = this.width, e.height = this.height, e.getContext("2d").drawImage(this, 0, 0), e.toBlob(function (n) {
                    let l = new File([n], "1x4.PNG", {type: "image/png"}), s = new DataTransfer;
                    s.items.add(l);
                    let o = document.getElementById("dropzone-file");
                    o.files = s.files;
                    let i = new Event("change", {bubbles: !0});
                    o.dispatchEvent(i), document.getElementById("example-image").closest(".bg-white").classList.add("hidden")
                }, "image/png")
            })
        }

        function Ce(e, t) {
            var n = new Image;
            return n.onload = t, n.setAttribute("crossorigin", "anonymous"), n.src = e, n
        }

        function ke(e) {
            b.plausible && b.plausible("downvote");
            let t = document.getElementById("report-issue");
            t.innerHTML = '<div class="spinner-border animate-spin inline-block w-4 h-4 border-2 rounded-full"></div>', t.disabled = !0;
            let n = document.getElementById("feedback-text").value;
            document.getElementById("feedback-text").classList.add("hidden"), fetch(e).then(s => s.blob()).then(s => {
                let o = new FormData;
                o.append("file", s, "screenshot.png"), o.append("text", n), fetch("https://blockblastsolver.fly.dev/upload", {
                    method: "POST",
                    body: o
                }).then(i => i.json()).then(i => {
                    console.log("Success:", i), t.innerHTML = "Thank you!", Z()
                }).catch(i => {
                    console.error("Error:", i), t.innerHTML = "Thank you!", Z()
                })
            })
        }

        function Z() {
            document.getElementById("close-report").classList.add("hidden")
        }

        function He() {
            let e = document.createElement("div");
            e.className = "mt-4 bg-white p-6 rounded-lg shadow-sm", e.innerHTML = `
        <div class="max-w-md mx-auto">
            <p class="text-gray-700 mb-4 text-center font-bold text-lg">\u{1F9E9} Unlock Access! \u{1F9E9}<br/><span class="text-sm font-normal text-blue-600">Drop your WhatsApp # for instant exclusive iOS access - Limited spots available!</span></p>
            <div class="flex flex-col space-y-2">
                <input type="tel" id="whatsapp-input" placeholder="Enter your WhatsApp number" 
                    class="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <button id="submit-whatsapp" 
                    class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-300">
                    Get free iOS access
                </button>
                <div id="whatsapp-status" class="text-sm"></div>
            </div>
        </div>
    `;
            let t = document.getElementById("manual-input-sections");
            t.parentNode.insertBefore(e, t.nextSibling);
            let n = document.getElementById("submit-whatsapp"), l = document.getElementById("whatsapp-status");
            n.addEventListener("click", async () => {
                let s = document.getElementById("whatsapp-input").value.trim();
                if (!s || !/^\+?[1-9]\d{1,14}$/.test(s)) {
                    l.textContent = "Please enter a valid WhatsApp number", l.className = "text-sm text-red-600";
                    return
                }
                n.disabled = !0, n.innerHTML = '<div class="spinner-border animate-spin inline-block w-4 h-4 border-2 rounded-full"></div>';
                try {
                    if ((await fetch("https://blockblastsolver.fly.dev/collect_email", {
                        method: "POST",
                        headers: {"Content-Type": "application/json"},
                        body: JSON.stringify({email: s})
                    })).ok) l.textContent = "Thanks! We'll contact you soon.", l.className = "text-sm text-green-600", document.getElementById("whatsapp-input").value = ""; else throw new Error("Failed to submit")
                } catch {
                    l.textContent = "Something went wrong. Please try again.", l.className = "text-sm text-red-600"
                }
                n.disabled = !1, n.textContent = "Get notified when app launches"
            })
        }

        function Me() {
            let e = document.getElementById("toggle-manual-input"),
                t = document.getElementById("manual-input-sections"),
                n = document.getElementById("dropzone-file-container"), l = document.getElementById("solve-manual"),
                s = document.getElementById("manual-grid"), o = !1, i = null;
            for (let a = 0; a < BOARD_SIZE * BOARD_SIZE; a++) {
                let c = document.createElement("div");
                c.className = `w-6 h-6 sm:w-${BS} sm:h-${BS} bg-green-500 cursor-pointer hover:bg-green-400`, c.dataset.filled = "0", c.dataset.cellId = `grid-cell-${a}`, c.addEventListener("mousedown", d => {
                    d.preventDefault(), o = !0, i = c.dataset.filled === "0", G(c)
                }), c.addEventListener("mouseenter", () => {
                    if (o && i !== null) {
                        let d = i;
                        (d && c.dataset.filled === "0" || !d && c.dataset.filled === "1") && G(c)
                    }
                }), s.appendChild(c)
            }
            document.addEventListener("mouseup", () => {
                o = !1, i = null
            }), document.querySelectorAll(".manual-figure").forEach((a, c) => {
                let d = !1, m = null;
                for (let u = 0; u < 25; u++) {
                    let r = document.createElement("div");
                    r.className = "w-6 h-6 bg-green-500 cursor-pointer hover:bg-green-400", r.dataset.filled = "0", r.dataset.cellId = `figure-${c}-cell-${u}`, r.addEventListener("mousedown", g => {
                        g.preventDefault(), d = !0, m = r.dataset.filled === "0", N(r)
                    }), r.addEventListener("mouseenter", () => {
                        if (d && m !== null) {
                            let g = m;
                            (g && r.dataset.filled === "0" || !g && r.dataset.filled === "1") && N(r)
                        }
                    }), a.appendChild(r)
                }
                a.addEventListener("mouseup", () => {
                    d = !1, m = null
                }), a.addEventListener("mouseleave", () => {
                    d = !1, m = null
                })
            }), e.onclick = Fe, l.onclick = De
        }

        function Fe() {
            document.getElementById("manual-input-sections").classList.toggle("hidden"), setTimeout(() => {
                document.getElementById("manual-input-sections").scrollIntoView({behavior: "smooth", block: "start"})
            }, 200), D()
        }

        function G(e) {
            let t = e.dataset.filled === "1";
            e.dataset.filled = t ? "0" : "1", e.className = `w-6 h-6 sm:w-${BS} sm:h-${BS} cursor-pointer hover:opacity-80 ${t ? "bg-green-500" : "bg-red-500"}`
        }

        function Te(e) {
            e.dataset.filled = "1", e.className = `w-6 h-6 sm:w-${BS} sm:h-${BS} cursor-pointer hover:opacity-80 bg-red-500`
        }

        function Se() {
            document.querySelectorAll(".manual-figure").forEach(t => {
                let n = t.children;
                for (let l = 0; l < n.length; l++) {
                    let s = n[l];
                    s.dataset.filled = "0", s.className = "w-6 h-6 bg-green-500 cursor-pointer hover:opacity-80"
                }
            })
        }

        function N(e) {
            let t = e.dataset.filled === "1";
            e.dataset.filled = t ? "0" : "1", e.className = `w-6 h-6 cursor-pointer hover:opacity-80 ${t ? "bg-green-500" : "bg-red-500"}`
        }

        function De() {
            _(), b.plausible && b.plausible("manual_solve");
            let e = [], n = document.getElementById("manual-grid").children;
            for (let s = 0; s < BOARD_SIZE; s++) {
                let o = [];
                for (let i = 0; i < BOARD_SIZE; i++) {
                    let a = n[s * BOARD_SIZE + i];
                    o.push(+(a.dataset.filled === "1"))
                }
                e.push(o)
            }
            let l = [];
            document.querySelectorAll(".manual-figure").forEach(s => {
                let o = [], i = s.children;
                for (let a = 0; a < 5; a++) {
                    let c = [];
                    for (let d = 0; d < 5; d++) {
                        let m = i[a * 5 + d];
                        c.push(+(m.dataset.filled === "1"))
                    }
                    o.push(c)
                }
                o.some(a => a.some(c => c === 1)) && l.push(o)
            }), l = l.map(s => W(s)), $e(e), Ge(l), console.log("ManualGridInfo", e), console.log("ManualFiguresInfo", l), P(e, l), Y()
        }

        function $e(e) {
            let t = document.getElementById("grid-container"), n = document.getElementById("grid-tiles");
            n.innerHTML = "", t.classList.remove("hidden"), e.forEach(l => {
                l.forEach(s => {
                    let o = document.createElement("div");
                    o.className = `w-6 h-6 sm:w-${BS} sm:h-${BS} ${s === 0 ? "bg-green-500" : "bg-red-500"}`, n.appendChild(o)
                })
            })
        }

        function Ge(e) {
            let t = document.getElementById("figures-container"), n = document.getElementById("figures-grid");
            n.innerHTML = "", t.classList.remove("hidden"), e.forEach((l, s) => {
                let o = document.createElement("div");
                o.className = `flex flex-col items-center mb-${BS}`, o.innerHTML = `
            <h3 class="text-lg font-semibold mb-2">Figure ${s + 1}</h3>
            <div class="grid gap-1" style="grid-template-columns: repeat(${l[0].length}, minmax(0, 1fr));">
                ${l.flat().map(i => `
                    <div class="w-6 h-6 ${i ? "bg-blue-500" : "bg-white"} border border-gray-200"></div>
                `).join("")}
            </div>
        `, n.appendChild(o)
            })
        }

        function Xe() {
            console.log("Adding continue buttons")
        }

        function Oe() {
            document.getElementById("footer").insertAdjacentHTML("beforebegin", `
        <div id="ph-feedback-container" class="mt-9 p-4 bg-white rounded-lg shadow-md mb-10">
            <form id="ph-feedback-form" class="space-y-4">
                <div>
                    <label for="feedback-message" class="block text-sm font-medium text-gray-700 mb-1">
                        How you hear about this app?
                    </label>
                    <textarea 
                        id="feedback-message" 
                        name="feedback-message" 
                        rows="4" 
                        class="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        required
                    ></textarea>
                </div>
                <button 
                    type="submit" 
                    class="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-200"
                >
                    Send Answer
                </button>
            </form>
            <div id="ph-feedback-status" class="mt-2 text-sm hidden"></div>
        </div>
    `), document.getElementById("ph-feedback-form").addEventListener("submit", Ne)
        }

        function Ne(e) {
            e.preventDefault();
            let t = e.target, n = t.querySelector('button[type="submit"]'),
                l = document.getElementById("ph-feedback-status"), s = t.querySelector("#feedback-message").value;
            n.disabled = !0, n.innerHTML = '<div class="spinner-border animate-spin inline-block w-4 h-4 border-2 rounded-full"></div>';
            let o = new FormData;
            o.append("text", `[${Intl.DateTimeFormat().resolvedOptions().timeZone}] ${s}`), o.append("file", new Blob([""], {type: "image/png"}), "empty.png"), fetch("https://blockblastsolver.fly.dev/upload", {
                method: "POST",
                body: o
            }).then(i => i.json()).then(i => {
                l.textContent = "Thank you for response!", l.className = "mt-2 text-sm text-green-600", l.classList.remove("hidden"), t.reset()
            }).catch(i => {
                l.textContent = "Error sending feedback. Please try again.", l.className = "mt-2 text-sm text-red-600", l.classList.remove("hidden")
            }).finally(() => {
                n.disabled = !1, n.textContent = "Send"
            })
        }

        b.App = b.App || {}, b.App.initializeApp = function () {
            typeof O == "function" ? O() : console.error("initializeApp function not found")
        }
    })(window);
})();
