(function() {
    var e = 87600;

    function t(e, t) {
        return n => n < e || n > t ? `必须在 ${e} 和 ${t} 之间` : null
    }

    function n(e) {
        return t => t < e ? `必须至少为 ${e}` : null
    }

    function r() {
        return e => {
            if (!e || e.trim().length === 0) return null;
            try {
                return new RegExp(e), null
            } catch {
                return `无效的正则表达式`
            }
        }
    }
    var i = {
            AnalysisPercent: [t(1, 50)],
            SettledSeasonDelayHours: [t(0, e)],
            AnalysisLengthLimit: [n(1)],
            MinimumIntroDuration: [n(1)],
            MaximumIntroDuration: [n(1)],
            MinimumCreditsDuration: [n(1)],
            MaximumCreditsDuration: [n(1)],
            MaximumMovieCreditsDuration: [n(1)],
            MinimumRecapDuration: [n(1)],
            MaximumRecapDuration: [n(1)],
            MinimumRecapDetectionDuration: [n(1)],
            MaximumRecapDetectionDuration: [n(1)],
            BlackFrameMinimumPercentage: [t(0, 100)],
            BlackFrameThreshold: [t(16, 255)],
            MaxParallelism: [n(1)],
            ProcessThreads: [t(0, 16)],
            SkipbuttonHideDelay: [t(0, 1e3)],
            SkipButtonVisibleSeconds: [t(0, 600)],
            SilenceDetectionMaximumNoise: [t(-90, 0)],
            SilenceDetectionMinimumDuration: [n(0)],
            ChapterAnalyzerIntroductionPattern: [r()],
            ChapterAnalyzerEndCreditsPattern: [r()],
            ChapterAnalyzerPreviewPattern: [r()],
            ChapterAnalyzerRecapPattern: [r()],
            ChapterAnalyzerCommercialPattern: [r()]
        },
        a = [
            [`MinimumIntroDuration`, `MaximumIntroDuration`],
            [`MinimumCreditsDuration`, `MaximumCreditsDuration`],
            [`MinimumRecapDuration`, `MaximumRecapDuration`],
            [`MinimumRecapDetectionDuration`, `MaximumRecapDetectionDuration`],
            [`MinimumPreviewDuration`, `MaximumPreviewDuration`],
            [`MinimumCommercialDuration`, `MaximumCommercialDuration`]
        ],
        o = new class {
            validate(e, t) {
                let n = i[e];
                if (!n) return null;
                for (let e of n) {
                    let n = e(t);
                    if (n) return n
                }
                return null
            }
            getLinkedFields(e) {
                let t = [];
                for (let [n, r] of a) e === n ? t.push(r) : e === r && t.push(n);
                return t
            }
            validateCrossFieldFor(e, t) {
                for (let [n, r] of a) {
                    if (e === n) return t[n] >= t[r] ? `必须小于最大值` : null;
                    if (e === r) return t[n] >= t[r] ? `必须大于最小值` : null
                }
                return null
            }
            validateAll(e) {
                let t = new Map;
                for (let n of Object.keys(i)) {
                    let r = e[n],
                        i = this.validate(n, r);
                    i && t.set(n, i)
                }
                for (let [n, r] of a) !t.has(n) && !t.has(r) && e[n] >= e[r] && (t.set(n, `必须小于最大值`), t.set(r, `必须大于最小值`));
                return t
            }
        };

    function s(e, t, ...n) {
        let r = document.createElement(e);
        if (t)
            for (let [e, n] of Object.entries(t)) e === `className` ? r.className = n : r.setAttribute(e, n);
        for (let e of n) r.append(typeof e == `string` ? document.createTextNode(e) : e);
        return r
    }

    function c(e, t, n) {
        let r = s(e, t);
        return r.innerHTML = n, r
    }

    function l(e, t) {
        let n = t?.display ?? `inline`;
        return e.setAttribute(`aria-live`, `polite`), e.setAttribute(`aria-atomic`, `true`), e.style.display = `none`, {
            element: e,
            show(t, r) {
                e.textContent = t, e.style.color = r ?? ``, e.style.display = t ? n : `none`
            },
            clear() {
                e.textContent = ``, e.style.color = ``, e.style.display = `none`
            }
        }
    }

    function u(e) {
        return l(s(`div`, {
            className: e?.className ?? `status-message`
        }), {
            display: e?.display ?? `inline`
        })
    }
    async function d(e) {
        window.Dashboard.showLoadingMsg();
        try {
            return await e()
        } finally {
            window.Dashboard.hideLoadingMsg()
        }
    }
    var f = `c83d86bb-a1e0-4c35-a113-e2101cf4ee6b`;
    async function p(e, t, n) {
        let r = window.ApiClient.serverAddress().replace(/\/+$/, ``) + `/` + e,
            i = {
                Authorization: `MediaBrowser Token=` + window.ApiClient.accessToken()
            };
        return (t === `POST` || t === `PUT`) && (i[`Content-Type`] = `application/json`), await fetch(r, {
            method: t,
            headers: i,
            body: n
        })
    }

    function m(e) {
        return v(e, `GET`)
    }

    function h() {
        return window.ApiClient.getPluginConfiguration(f)
    }

    function g(e) {
        return window.ApiClient.updatePluginConfiguration(f, e)
    }
    async function _(e) {
        try {
            let t = await e.json();
            if (typeof t == `string` && t.length > 0) return t;
            if (typeof t == `object` && t)
                for (let e of [`title`, `detail`, `Message`]) {
                    let n = Reflect.get(t, e);
                    if (typeof n == `string` && n.length > 0) return n
                }
        } catch {}
        return `Server returned ` + e.status
    }
    async function v(e, t, n) {
        try {
            let r = await p(e, t, n === void 0 ? null : JSON.stringify(n));
            return r.ok ? {
                ok: !0,
                status: r.status,
                data: r.status === 204 ? null : await r.json()
            } : {
                ok: !1,
                status: r.status,
                error: await _(r)
            }
        } catch (e) {
            return {
                ok: !1,
                status: null,
                error: e instanceof Error ? e.message : `Network error`
            }
        }
    }

    function y(e, t = !0) {
        return m(`Episode/${encodeURIComponent(e)}/Segments?includeSuppressed=${t}`)
    }

    function b(e, t) {
        return v(`Episode/${encodeURIComponent(e)}/Segments`, `POST`, t)
    }

    function x(e, t, n) {
        return v(`Episode/${encodeURIComponent(e)}/Segments/${encodeURIComponent(t)}`, `PUT`, n)
    }

    function S(e, t) {
        return v(`Episode/${encodeURIComponent(e)}/Segments/${encodeURIComponent(t)}`, `DELETE`)
    }

    function C(e, t) {
        return v(`Episode/${encodeURIComponent(e)}/Segments/${encodeURIComponent(t)}/Restore`, `POST`)
    }

    function w(e) {
        return m(`Intros/AnalyzerActions/${encodeURIComponent(e)}`)
    }

    function ee(e, t) {
        return p(`Intros/AnalyzerActions/UpdateSeason`, `POST`, JSON.stringify({
            id: e,
            analyzerActions: t
        }))
    }

    function T(e) {
        return m(`Intros/DisabledItems/${encodeURIComponent(e)}`)
    }

    function E(e, t) {
        return v(`Intros/DisabledItems/${encodeURIComponent(e)}`, t ? `PUT` : `DELETE`)
    }

    function te(e, t) {
        return p(`Intros/ScanSeason/${encodeURIComponent(e)}/${encodeURIComponent(t)}`, `POST`)
    }

    function ne() {
        return m(`Intros/ScanStatus`)
    }

    function D(e, t) {
        return p(`Intros/EraseTimestamps?mode=${encodeURIComponent(e)}&eraseCache=${t}`, `POST`)
    }

    function re(e, t) {
        return p(`${e}?eraseCache=${t}`, `DELETE`)
    }

    function O(e, t) {
        return typeof Reflect.get(e, t) == `number`
    }

    function ie(e) {
        return typeof e == `object` && !!e && O(e, `AffectedItems`) && O(e, `RemovedSegments`) && O(e, `RemovedCacheEntries`)
    }
    async function ae() {
        let e = await v(`Intros/ExcludedTimestamps/Clear`, `POST`);
        return e.ok ? ie(e.data) ? {
            ok: !0,
            status: e.status,
            data: e.data
        } : {
            ok: !1,
            status: e.status,
            error: `清除响应格式异常`
        } : {
            ok: !1,
            status: e.status,
            error: e.error
        }
    }
    async function oe() {
        let e = await p(`IntroSkipper/SupportBundle/Json`, `GET`);
        if (!e.ok) throw Error(`获取支持包失败（HTTP ` + e.status + `)`);
        let t = await e.json();
        if (typeof t?.Markdown != `string` || !Array.isArray(t.Sections)) throw Error(`支持包响应格式异常`);
        return t
    }
    async function se() {
        let e = await p(`System/Info/Storage`, `GET`);
        if (!e.ok) throw Error(`获取存储占用失败（HTTP ` + e.status + `)`);
        let t = await e.json();
        if (!Array.isArray(t?.Libraries)) throw Error(`存储响应格式异常`);
        return t.Libraries
    }

    function ce(e) {
        return p(`Intros/RebuildDatabase` + (e?.forceCleanOnBackupFailure ? `?forceCleanOnBackupFailure=true` : ``), `POST`)
    }

    function le() {
        return p(`SkipButtonCss/InjectCss`, `POST`)
    }

    function ue() {
        return p(`SkipButtonCss/UpdateSkipDuration`, `POST`)
    }
    async function de() {
        let e = await p(`Plugins`, `GET`);
        if (!e.ok) throw Error(`获取插件列表失败（HTTP ` + e.status + `)`);
        return await e.json()
    }
    var k = null,
        A = null,
        j = new Map,
        M = [],
        N = !1;

    function P(e) {
        return Array.isArray(e) ? e.filter(e => typeof e == `string`) : []
    }

    function fe(e) {
        let t = e;
        return typeof t.UseLegacyBlackFrameAnalyzer != `boolean` && typeof t.UseAlternativeBlackFrameAnalyzer == `boolean` && (e.UseLegacyBlackFrameAnalyzer = !t.UseAlternativeBlackFrameAnalyzer), delete t.UseAlternativeBlackFrameAnalyzer, e.SeriesExclusions = P(e.SeriesExclusions), e.MovieExclusions = P(e.MovieExclusions), e.PathExclusions = P(e.PathExclusions), e
    }
    var F = {
            subscribe(e, t) {
                j.has(e) || j.set(e, new Set), j.get(e).add(t), N && M.push({
                    event: e,
                    callback: t
                })
            },
            unsubscribe(e, t) {
                j.get(e)?.delete(t)
            },
            beginScope() {
                N = !0, M = []
            },
            endScope() {
                for (let {
                        event: e,
                        callback: t
                    }
                    of M) j.get(e)?.delete(t);
                M = [], N = !1
            },
            emit(e, ...t) {
                let n = j.get(e);
                if (n)
                    for (let e of n) e(...t)
            },
            async load() {
                try {
                    k = fe(await h()), A = JSON.parse(JSON.stringify(k)), this.emit(`loaded`)
                } catch (e) {
                    throw console.error(`加载插件配置失败`, e), window.Dashboard.alert(`加载配置失败`), Error(`加载插件配置失败`)
                }
            },
            get(e) {
                if (!k) throw Error(`配置未加载`);
                return k[e]
            },
            getAll() {
                if (!k) throw Error(`配置未加载`);
                return k
            },
            isLoaded() {
                return k !== null
            },
            set(e, t) {
                if (!k) throw Error(`配置未加载`);
                k[e] = t;
                let n = o.validate(e, t);
                n ||= o.validateCrossFieldFor(e, k);
                let r = o.getLinkedFields(e);
                for (let e of r) {
                    let t = o.validate(e, k[e]);
                    t ||= o.validateCrossFieldFor(e, k), this.emit(`validation`, {
                        field: e,
                        error: t
                    })
                }
                this.emit(`changed`, {
                    field: e,
                    value: t
                }), this.emit(`validation`, {
                    field: e,
                    error: n
                })
            },
            async save() {
                await d(async () => {
                    let e = fe(await h());
                    Object.assign(e, k);
                    let t = await g(e);
                    ue().catch(console.error), k = e, A = JSON.parse(JSON.stringify(e)), window.Dashboard.processPluginConfigurationUpdateResult(t), this.emit(`saved`)
                })
            },
            isDirty() {
                return !k || !A ? !1 : JSON.stringify(k) !== JSON.stringify(A)
            }
        },
        pe = 3e3;

    function me(e) {
        let t = s(`div`, {
                className: `app-shell`
            }),
            n = s(`a`, {
                className: `skip-link`,
                href: `#settings-main`
            }, `跳到主要内容`),
            r = `app-title`,
            i = s(`h1`, {
                className: `app-title`,
                id: r
            }, `Intro Skipper 设置`),
            a = s(`header`, {
                className: `app-header`,
                "aria-labelledby": r
            });
        a.append(i);
        let c = s(`nav`, {
                className: `app-sidebar`,
                "aria-label": `设置分区`
            }),
            l = s(`main`, {
                className: `app-content`,
                id: `settings-main`,
                tabindex: `-1`
            }),
            u = s(`footer`, {
                className: `app-footer`,
                "aria-label": `保存控件`
            }),
            d = s(`span`, {
                className: `footer-status-message`,
                "aria-live": `polite`,
                "aria-atomic": `true`
            });
        d.style.display = `none`;
        let f = s(`span`, {
            className: `dirty-indicator`,
            "aria-live": `polite`
        }, `● 有未保存的更改`);
        f.style.display = `none`;
        let p = s(`button`, {
            className: `save-button`,
            type: `button`,
            "aria-label": `保存配置`
        }, `保存`);
        u.append(d, f, p), t.append(n, a, c, l, u), e.append(t);
        let m = null,
            h = () => {
                d.textContent = ``, d.dataset.state = ``, d.style.display = `none`
            },
            g = (e, t) => {
                m !== null && (window.clearTimeout(m), m = null), d.textContent = e, d.dataset.state = t, d.style.display = e ? `inline` : `none`, t === `success` && (m = window.setTimeout(() => {
                    F.isDirty() || h()
                }, pe))
            },
            _ = e => {
                e.preventDefault(), l.focus()
            },
            v = async () => {
                if (!p.disabled) {
                    p.disabled = !0, p.textContent = `正在保存…`, g(`正在保存…`, `info`);
                    try {
                        await F.save(), g(`更改已保存`, `success`)
                    } catch {
                        g(`保存失败`, `error`), window.Dashboard.alert(`保存配置失败`)
                    } finally {
                        p.disabled = !1, p.textContent = `保存`
                    }
                }
            }, y = () => {
                o.validateAll(F.getAll()).size > 0 ? window.Dashboard.confirm(`存在校验警告，仍要保存吗？`, `校验提示`, e => {
                    e && v()
                }) : v()
            }, b = e => {
                F.isDirty() && (e.preventDefault(), e.returnValue = ``)
            };
        n.addEventListener(`click`, _), p.addEventListener(`click`, y), window.addEventListener(`beforeunload`, b);
        let x = () => {
                let e = F.isDirty();
                f.style.display = e ? `inline` : `none`, e && d.dataset.state !== `error` && h()
            },
            S = () => {
                f.style.display = `none`
            };
        return F.subscribe(`changed`, x), F.subscribe(`saved`, S), F.subscribe(`loaded`, S), {
            navEl: c,
            contentEl: l,
            destroy() {
                n.removeEventListener(`click`, _), p.removeEventListener(`click`, y), window.removeEventListener(`beforeunload`, b), F.unsubscribe(`changed`, x), F.unsubscribe(`saved`, S), F.unsubscribe(`loaded`, S), m !== null && window.clearTimeout(m)
            }
        }
    }
    var he = class {
            tabs = [];
            activeTab = null;
            contentEl;
            navEl;
            constructor(e, t) {
                this.navEl = e, this.contentEl = t
            }
            register(e) {
                this.tabs.push(e);
                let t = s(`button`, {
                    className: `tab-button`,
                    "data-tab-id": e.id
                }, e.label);
                t.addEventListener(`click`, () => {
                    this.switchTo(e.id)
                }), this.navEl.appendChild(t)
            }
            switchTo(e) {
                F.endScope(), this.activeTab?.destroy?.(), this.contentEl.replaceChildren();
                let t = this.tabs.find(t => t.id === e);
                if (!t) return;
                F.beginScope(), t.render(this.contentEl), this.activeTab = t;
                let n = this.navEl.querySelectorAll(`.tab-button`);
                for (let t of n) t.getAttribute(`data-tab-id`) === e ? t.classList.add(`tab-active`) : t.classList.remove(`tab-active`)
            }
            destroy() {
                F.endScope(), this.activeTab?.destroy?.(), this.activeTab = null
            }
        },
        ge = new Set([`movies`, `tvshows`, `folders`]);

    function _e(e) {
        return e == null || ge.has(e)
    }
    async function ve() {
        let e = await m(`UserViews`);
        return e.ok ? (e.data?.Items ?? []).filter(e => e.Id && _e(e.CollectionType)).map(e => ({
            Id: e.Id,
            Name: e.Name ?? `未知`,
            CollectionType: e.CollectionType ?? null
        })) : (console.error(`Failed to load libraries`, e.error), [])
    }
    async function ye(e, t) {
        let n = await m(`Items?${new URLSearchParams({parentId:e,includeItemTypes:`Series,Movie`,sortBy:`SortName`,sortOrder:`Ascending`,recursive:`true`}).toString()}`);
        return n.ok ? (n.data?.Items ?? []).filter(e => e.Id).map(n => ({
            Id: n.Id,
            Name: n.Name ?? `Unknown`,
            ProductionYear: n.ProductionYear ?? null,
            Type: n.Type === `Movie` ? `Movie` : `Series`,
            LibraryId: e,
            LibraryName: t
        })) : (console.error(`Failed to load shows for library`, e, n.error), [])
    }
    async function be(e) {
        let t = await m(`Shows/${encodeURIComponent(e)}/Seasons`);
        return t.ok ? (t.data?.Items ?? []).filter(e => e.Id).map(e => ({
            Id: e.Id,
            Name: e.Name ?? `未知`,
            IndexNumber: e.IndexNumber ?? null
        })) : (console.error(`Failed to load seasons for series`, e, t.error), [])
    }
    async function xe(e, t) {
        let n = new URLSearchParams({
                seasonId: t,
                enableImages: `true`
            }),
            r = await m(`Shows/${encodeURIComponent(e)}/Episodes?${n.toString()}`);
        return r.ok ? (r.data?.Items ?? []).filter(e => e.Id).map(e => ({
            Id: e.Id,
            Name: e.Name ?? `未知`,
            IndexNumber: e.IndexNumber ?? null,
            RunTimeTicks: e.RunTimeTicks ?? null,
            SeriesName: e.SeriesName ?? null
        })) : (console.error(`Failed to load episodes for series`, e, r.error), [])
    }

    function Se(e, t = 60) {
        return window.ApiClient.serverAddress() + `/Items/` + e + `/Images/Primary?fillHeight=` + t + `&quality=90`
    }

    function Ce(e, t) {
        if (!t || t.length === 0) return;
        let n = new Set((e.getAttribute(`aria-describedby`) ?? ``).split(/\s+/).filter(Boolean));
        for (let e of t) n.add(e);
        e.setAttribute(`aria-describedby`, Array.from(n).join(` `))
    }

    function we(e, t) {
        if (!t) return;
        let n = () => {
            e.style.display = t() ? `` : `none`
        };
        F.subscribe(`loaded`, n), F.subscribe(`changed`, n), F.isLoaded() && n()
    }

    function I(e) {
        let {
            container: t,
            input: n,
            fieldOpts: r,
            errorDiv: i,
            describedByIds: a,
            onLoaded: o
        } = e, s = () => {
            r.visible && (t.style.display = r.visible() ? `` : `none`)
        }, c = () => {
            if (r.disabled) {
                let e = r.disabled();
                n.disabled = e, t.classList.toggle(`disabled-block`, e)
            }
        };
        if (F.subscribe(`loaded`, () => {
                o(), s(), c()
            }), F.isLoaded() && (o(), s(), c()), r.visible && F.subscribe(`changed`, s), r.disabled && F.subscribe(`changed`, c), F.subscribe(`changed`, (...e) => {
                e[0]?.field === r.id && document.activeElement !== n && o()
            }), Ce(n, a), i) {
            let e = i.id || r.id + `-error`;
            i.id = e, i.setAttribute(`aria-live`, `polite`), i.setAttribute(`aria-atomic`, `true`), i.setAttribute(`role`, `status`), Ce(n, [e]), F.subscribe(`validation`, (...e) => {
                let t = e[0];
                t.field === r.id && (t.error ? (i.textContent = t.error, i.style.display = ``, n.classList.add(`field-error-active`), n.setAttribute(`aria-invalid`, `true`)) : (i.textContent = ``, i.style.display = `none`, n.classList.remove(`field-error-active`), n.removeAttribute(`aria-invalid`)))
            })
        }
    }

    function L(e, ...t) {
        let n = t.filter(e => e instanceof Node);
        n.length > 0 && e.append(...n)
    }

    function Te(...e) {
        let t = s(`div`, {
            className: `side-by-side`
        });
        return t.append(...e), t
    }

    function R(e, t) {
        let n = [];
        if (t.description) {
            let r = {
                className: `field-description`
            };
            t.idBase && (r.id = t.idBase + `-description`);
            let i = c(`div`, r, t.description);
            e.append(i), i.id && n.push(i.id)
        }
        if (t.warning) {
            let r = {
                className: `field-warning`
            };
            t.idBase && (r.id = t.idBase + `-warning`);
            let i = c(`div`, r, t.warning);
            e.append(i), i.id && n.push(i.id)
        }
        return n
    }

    function z(e) {
        let t = `field-` + e.id,
            n = s(`div`, {
                className: e.description ? `checkbox-container checkbox-container-withDescription` : `checkbox-container`
            }),
            r = s(`label`, {
                className: `checkbox-label`
            }),
            i = s(`input`, {
                type: `checkbox`,
                id: t,
                name: e.id
            }),
            a = s(`span`, {}, e.label);
        r.append(i, a), n.append(r);
        let o = R(n, {
                ...e,
                idBase: t
            }),
            c = e.id;
        return I({
            container: n,
            input: i,
            fieldOpts: e,
            describedByIds: o,
            onLoaded: () => {
                i.checked = F.get(c)
            }
        }), i.addEventListener(`change`, () => {
            F.set(c, i.checked), e.onChange?.(i.checked)
        }), n
    }
    var Ee = 180;

    function B(e) {
        let t = s(`div`, {
                className: `input-container`
            }),
            n = `field-` + e.id,
            r = s(`label`, {
                className: `input-label`
            }, e.label);
        r.setAttribute(`for`, n), t.append(r);
        let i = {
            type: `number`,
            id: n,
            name: e.id,
            autocomplete: `off`,
            inputmode: e.step !== void 0 && String(e.step).includes(`.`) ? `decimal` : `numeric`
        };
        e.min !== void 0 && (i.min = String(e.min)), e.max !== void 0 && (i.max = String(e.max)), e.step !== void 0 && (i.step = String(e.step));
        let a = s(`input`, i);
        t.append(a);
        let o = s(`div`, {
            className: `field-error`
        });
        t.append(o);
        let c = R(t, {
                ...e,
                idBase: n
            }),
            l = e.id;
        I({
            container: t,
            input: a,
            fieldOpts: e,
            errorDiv: o,
            describedByIds: c,
            onLoaded: () => {
                a.value = String(F.get(l))
            }
        });
        let u = null;
        return a.addEventListener(`input`, () => {
            u && clearTimeout(u), u = setTimeout(() => {
                if (a.value === ``) return;
                let t = Number(a.value);
                Number.isNaN(t) || (F.set(l, t), e.onChange?.(t))
            }, Ee)
        }), t
    }

    function De(e, t) {
        let n = s(`fieldset`, {
                className: `checkbox-container analyze-for analyze-for-group`
            }),
            r = s(`legend`, {
                className: `title analyze-for-legend`
            }, e);
        n.append(r);
        for (let e of t) {
            let t = `field-` + e.id,
                r = s(`label`, {
                    className: `checkbox-label`,
                    for: t
                }),
                i = s(`input`, {
                    type: `checkbox`,
                    id: t,
                    name: e.id
                }),
                a = s(`span`, {}, e.label);
            r.append(i, a), n.append(r);
            let o = e.id;
            I({
                container: r,
                input: i,
                fieldOpts: {
                    id: e.id
                },
                onLoaded: () => {
                    i.checked = F.get(o)
                }
            }), i.addEventListener(`change`, () => {
                F.set(o, i.checked)
            })
        }
        return n
    }

    function Oe(e, t) {
        let n = s(`button`, {
            className: `action-button raised block`
        }, e);
        return n.addEventListener(`click`, async () => {
            n.disabled = !0;
            try {
                await t()
            } finally {
                n.disabled = !1
            }
        }), n
    }

    function ke(e) {
        if (!Array.isArray(e)) return [];
        let t = [];
        for (let n of e)
            if (typeof n == `string`) {
                let e = n.trim();
                e.length > 0 && t.push(e)
            } return t
    }

    function Ae(e, t) {
        return e.some(e => e.toLocaleLowerCase() === t.toLocaleLowerCase())
    }

    function V(e) {
        return ke(F.get(e))
    }

    function je(e) {
        if (typeof e != `object` || !e) return null;
        let t = Reflect.get(e, `field`);
        return typeof t == `string` ? t : null
    }

    function Me(e, t) {
        t.length > 0 && e.setAttribute(`aria-describedby`, t.join(` `))
    }

    function H(e) {
        let t = s(`div`, {
                className: `input-container exclusion-list-field`
            }),
            n = `field-` + e.id,
            r = n + `-suggestions`,
            i = s(`label`, {
                className: `input-label`,
                for: n
            }, e.label),
            a = document.createElement(`input`);
        a.type = `text`, a.id = n, a.name = e.id, a.autocomplete = `off`, e.placeholder && (a.placeholder = e.placeholder);
        let o = s(`button`, {
                className: `exclusion-add-button`,
                type: `button`
            }, `添加`),
            c = s(`div`, {
                className: `exclusion-input-row`
            });
        c.append(a, o);
        let l = s(`div`, {
                className: `field-error`,
                id: n + `-error`,
                role: `status`,
                "aria-live": `polite`,
                "aria-atomic": `true`
            }),
            u = s(`ul`, {
                className: `exclusion-list-values`
            }),
            d = s(`div`, {
                className: `exclusion-list-empty`
            }, `暂无条目`),
            f = [l.id];
        t.append(i, c, l), f.push(...R(t, {
            ...e,
            idBase: n
        })), t.append(u, d), Me(a, f);
        let p = e.suggestions ? s(`datalist`, {
            id: r
        }) : null;
        p && (a.setAttribute(`list`, r), t.append(p));

        function m(e) {
            l.textContent = e ?? ``, l.style.display = e ? `` : `none`, a.classList.toggle(`field-error-active`, !!e), e ? a.setAttribute(`aria-invalid`, `true`) : a.removeAttribute(`aria-invalid`)
        }

        function h() {
            let t = V(e.id);
            u.replaceChildren(), d.style.display = t.length === 0 ? `` : `none`;
            for (let n of t) {
                let t = s(`li`, {
                        className: `exclusion-list-item`
                    }),
                    r = s(`span`, {
                        className: `exclusion-list-value`
                    }, n),
                    i = s(`button`, {
                        className: `exclusion-remove-button`,
                        type: `button`,
                        "aria-label": `移除 ` + n
                    }, `x`);
                i.addEventListener(`click`, () => {
                    F.set(e.id, V(e.id).filter(e => e !== n)), m(null)
                }), t.append(r, i), u.append(t)
            }
        }
        async function g() {
            let t = a.value.trim();
            if (t.length === 0) {
                m(`请先输入要添加的内容。`);
                return
            }
            let n = V(e.id);
            if (Ae(n, t)) {
                m(`该条目已在列表中。`);
                return
            }
            e.confirmAdd && !await e.confirmAdd(t) || (F.set(e.id, [...n, t]), a.value = ``, m(null), a.focus())
        }
        return o.addEventListener(`click`, () => {
            g().catch(e => {
                console.error(`Failed to add exclusion entry`, e), m(`添加条目失败。`)
            })
        }), a.addEventListener(`keydown`, e => {
            e.key === `Enter` && (e.preventDefault(), g().catch(e => {
                console.error(`Failed to add exclusion entry`, e), m(`添加条目失败。`)
            }))
        }), F.subscribe(`loaded`, h), F.subscribe(`changed`, (...t) => {
            je(t[0]) === e.id && h()
        }), F.isLoaded() && h(), e.suggestions && p && e.suggestions().then(e => {
            let t = new Set;
            for (let n of ke(e)) {
                let e = n.toLocaleLowerCase();
                t.has(e) || (t.add(e), p.append(s(`option`, {
                    value: n
                })))
            }
        }).catch(e => {
            console.error(`Failed to load exclusion suggestions`, e)
        }), t
    }
    var Ne = 0;

    function U(e) {
        return new Promise(t => {
            let n = String(++Ne),
                r = `is-confirm-title-` + n,
                i = `is-confirm-body-` + n,
                a = s(`dialog`, {
                    className: `is-confirm-dialog`
                });
            a.setAttribute(`aria-labelledby`, r), a.setAttribute(`aria-describedby`, i);
            let o = s(`h2`, {
                    id: r,
                    className: `is-confirm-title`
                }, e.title),
                c = s(`p`, {
                    id: i,
                    className: `is-confirm-body`
                }, e.body);
            a.append(o, c);
            let l = null;
            if (e.checkbox) {
                let t = `is-confirm-checkbox-` + n;
                l = s(`input`, {
                    type: `checkbox`,
                    id: t
                });
                let r = s(`label`, {
                    className: `is-confirm-checkbox-label`,
                    for: t
                });
                r.append(l, document.createTextNode(` ` + e.checkbox.label));
                let i = s(`div`, {
                    className: `is-confirm-checkbox-row`
                });
                i.append(r), a.append(i)
            }
            let u = s(`button`, {
                    className: `is-confirm-btn cancel`,
                    type: `button`
                }, e.cancelLabel ?? `取消`),
                d = s(`button`, {
                    className: `is-confirm-btn confirm`,
                    type: `button`
                }, e.confirmLabel ?? `确认`),
                f = s(`div`, {
                    className: `is-confirm-actions`
                });
            f.append(u, d), a.append(f);

            function p(e) {
                a.close(), a.remove(), t(e)
            }
            u.addEventListener(`click`, () => p(null)), d.addEventListener(`click`, () => p({
                checkboxChecked: l?.checked ?? !1
            })), a.addEventListener(`cancel`, e => {
                e.preventDefault(), p(null)
            }), a.addEventListener(`click`, e => {
                e.target === a && p(null)
            }), document.body.append(a), a.showModal(), u.focus()
        })
    }

    function Pe(e) {
        let t = e.trim().replace(/\\/g, `/`);
        for (; t.length > 1 && t.endsWith(`/`);) t = t.slice(0, -1);
        return t
    }

    function Fe(e) {
        let t = Pe(e);
        return t === `/` || /^[A-Za-z]:$/.test(t) ? !0 : t.startsWith(`//`) && t.split(`/`).filter(Boolean).length === 2
    }

    function Ie(e, t) {
        return new Promise(n => {
            window.Dashboard.confirm(e, t, n)
        })
    }
    async function Le(e) {
        return Fe(e) ? Ie(`该路径可能是文件系统根目录或驱动器根目录，排除它可能会跳过库中很大一部分内容。`, `确认排除路径`) : !0
    }
    async function Re(e) {
        let t = await ve();
        return (await Promise.all(t.map(e => ye(e.Id, e.Name)))).flat().filter(t => t.Type === e).map(e => e.Name).sort((e, t) => e.localeCompare(t))
    }
    async function ze() {
        let e = await se(),
            t = [];
        for (let n of e)
            for (let e of n.Folders) {
                let n = e.Path.trim();
                n.length > 0 && t.push(n)
            }
        return t
    }

    function W(e, t, n) {
        return `${String(e)} ${e===1?t:n}`
    }
    var Be = {
        id: `general`,
        label: `常规`,
        render(t) {
            let n = s(`div`, {
                className: `input-container`
            });
            n.append(s(`h3`, {
                className: `checkbox-list-label`
            }, `注入“跳过按钮”CSS`)), n.append(s(`div`, {
                className: `field-description`
            }, `将跳过按钮样式的 CSS 注入 Jellyfin 外观设置（通过 @import 语句）。`));
            let r = u();
            n.append(Oe(`注入 CSS`, async () => {
                r.show(`正在注入 CSS…`, `var(--is-accent)`);
                try {
                    let e = await le();
                    e.ok ? r.show(`跳过按钮 CSS 注入成功！`, `var(--is-success)`) : r.show(`注入 CSS 失败：服务器返回 ${String(e.status)}`, `var(--is-error)`)
                } catch (e) {
                    let t = e instanceof Error ? e.message : `未知错误`;
                    r.show(`注入 CSS 失败：${t}`, `var(--is-error)`)
                }
            })), n.append(r.element);
            let i = c(`div`, {
                className: `field-warning`
            }, `<strong>需要安装 File Transformation 插件</strong><br/>该功能依赖 File Transformation 插件。<a href="https://github.com/IAmParadox27/jellyfin-plugin-file-transformation" target="_blank">点此安装</a>`);
            we(i, () => !F.get(`FileTransformationPluginEnabled`));
            let a = s(`div`, {
                className: `input-container`
            });
            a.append(s(`h3`, {
                className: `checkbox-list-label`
            }, `清除排除的时间戳`), s(`div`, {
                className: `field-description`
            }, `删除当前命中排除列表的媒体对应的时间戳、缓存与季状态记录。`));
            let o = u({
                display: `block`
            });
            a.append(Oe(`清除排除的时间戳数据`, async () => {
                if (F.isDirty()) {
                    o.show(`清除时间戳数据前请先保存配置修改。`, `var(--is-error)`);
                    return
                }
                if (!await U({
                        title: `清除排除的时间戳`,
                        body: `删除当前命中排除列表的媒体的时间戳数据。同一季中未被排除的媒体会保留。`,
                        confirmLabel: `Clear`
                    })) return;
                o.show(`正在清除排除的时间戳数据…`, `var(--is-accent)`);
                let e = await ae();
                if (!e.ok || !e.data) {
                    o.show(e.error ?? `清除排除的时间戳数据失败。`, `var(--is-error)`);
                    return
                }
                o.show(`已清除 ${W(e.data.RemovedSegments,`条时间戳记录`,`条时间戳记录`)} 与 ${W(e.data.RemovedCacheEntries,`条缓存记录`,`条缓存记录`)}，涉及 ${W(e.data.AffectedItems,`个被排除条目`,`个被排除条目`)}。`, `var(--is-success)`)
            }), o.element), L(t, z({
                id: `AutoDetectIntros`,
                label: `自动分析新媒体`,
                description: `开启后，媒体加入媒体库时会自动分析可跳过片段。<br/><br/>提示：如需配置计划任务，请参见<a is="emby-linkbutton" class="button-link" href="#/dashboard/tasks">计划任务</a>。`
            }), z({
                id: `ReanalyzeSettledSeasons`,
                label: `重新分析已稳定季`,
                description: `当某季在设定延迟内没有新剧集时，重新分析整季，使最初仅由少数剧集检测出的片段基于整季重新计算。使用缓存的指纹，因此不会重新解码媒体。`
            }), B({
                id: `SettledSeasonDelayHours`,
                label: `季稳定判定延迟（小时）`,
                min: 0,
                max: e,
                step: 1,
                description: `某季在此小时数内没有新增剧集即视为已稳定。默认 24；周更剧集可适当调大。`,
                visible: () => F.get(`ReanalyzeSettledSeasons`) === !0
            }), z({
                id: `UpdateMediaSegments`,
                label: `扫描时更新缺失片段`,
                description: `启用后，库扫描期间会为所有未缓存的媒体更新片段。<br/>包括新加入、被修改或此前被跳过（但未被忽略）的文件。<br/><b>警告：</b>若你使用 Intro Skipper 以外的片段提供程序，应关闭此选项。`
            }), H({
                id: `SeriesExclusions`,
                label: `排除的剧集`,
                placeholder: `剧集名称`,
                description: `剧集名需完全一致（不区分大小写）。输入以从你的媒体库中选择。`,
                suggestions: () => Re(`Series`)
            }), H({
                id: `MovieExclusions`,
                label: `排除的电影`,
                placeholder: `电影名称`,
                description: `电影名需完全一致（不区分大小写）。输入以从你的媒体库中选择。`,
                suggestions: () => Re(`Movie`)
            }), H({
                id: `PathExclusions`,
                label: `排除的路径`,
                placeholder: `/media/library`,
                description: `列出的根路径及其子路径会被排除。服务器可上报存储目录作为建议项。`,
                suggestions: ze,
                confirmAdd: Le
            }), a, De(`分析以下片段类型：`, [{
                id: `ScanIntroduction`,
                label: `Introduction`
            }, {
                id: `ScanCredits`,
                label: `片尾（Credits）`
            }, {
                id: `ScanRecap`,
                label: `回述（Recap）`
            }, {
                id: `ScanPreview`,
                label: `预告（Preview）`
            }, {
                id: `ScanCommercial`,
                label: `Commercials`
            }]), z({
                id: `AnalyzeSeasonZero`,
                label: `分析第 0 季（特别篇 / 花絮）`,
                description: `注意：若剧集同时存在特别篇与花絮文件夹，花絮会被识别为第 0 季并忽略特别篇，与本设置无关。`
            }), z({
                id: `UseFileTransformationPlugin`,
                label: `使用 File Transformation 插件修补网页界面`,
                disabled: () => !F.get(`FileTransformationPluginEnabled`)
            }), i, B({
                id: `SkipbuttonHideDelay`,
                label: `跳过按钮隐藏延迟（秒）`,
                min: 0,
                max: 1e3,
                description: `跳过按钮自动隐藏前的秒数。设为 0 表示跳过按钮常驻（永不隐藏）。`,
                visible: () => F.get(`UseFileTransformationPlugin`) === !0,
                warning: `注意：该设置仅作用于网页客户端（浏览器、LG webOS、启用网页播放器的 Android 等）。可能需要刷新或清除缓存才能生效。`
            }), z({
                id: `AutoSkipIntro`,
                label: `自动跳过片头（Intro）`,
                description: `不显示跳过按钮而自动跳过片头片段。已在 Jellyfin 设置中明确自选偏好的用户仍按其偏好执行。`,
                visible: () => F.get(`UseFileTransformationPlugin`) === !0
            }), z({
                id: `AutoSkipCredits`,
                label: `自动跳过片尾（Credits/Outro）`,
                description: `不显示跳过按钮而自动跳过片尾片段。已在 Jellyfin 设置中明确自选偏好的用户仍按其偏好执行。`,
                visible: () => F.get(`UseFileTransformationPlugin`) === !0
            }), B({
                id: `SkipButtonVisibleSeconds`,
                label: `在片段结束前隐藏跳过按钮（秒）`,
                min: 0,
                max: 600,
                step: 1,
                description: `在片段结束前多少秒隐藏跳过按钮。设为 0 关闭该“接近结尾”限制；常规的按钮隐藏延迟仍然生效。`,
                visible: () => F.get(`UseFileTransformationPlugin`) === !0
            }), n, z({
                id: `EnableMainMenu`,
                label: `在主菜单显示 Intro Skipper`,
                description: `切换服务器主导航中的 Intro Skipper 入口。保存后刷新客户端（或清除缓存）生效。`
            }))
        }
    };

    function G(e, t, n, r, i, a, o) {
        let s = Te(B({
            id: e,
            label: n,
            min: 1,
            description: i
        }), B({
            id: t,
            label: r,
            min: 1,
            description: a
        }));
        return we(s, o), s
    }
    var Ve = {
        id: `analysis`,
        label: `分析`,
        render(e) {
            let t = c(`div`, {
                    className: `field-description`
                }, `<p>每个条目被分析的内容量，由“百分比”和“最大时长”共同决定，实际分析量取两者中的较小值（时长 &times; 百分比 与 最大时长）。</p><p>若修改百分比或最大时长，想要按新设置分析的剧集、季或电影，其<b>缓存的指纹与时间戳必须重建</b>。</p><p>调大以上任一设置都会显著增加剧集分析耗时。</p>`),
                n = () => F.get(`FullLengthChapters`) !== !0;
            L(e, z({
                id: `PreferChromaprint`,
                label: `优先使用 Chromaprint 分析`,
                description: `仅使用 chromaprint 进行分析（除非不可用）。在高级选项中设置的分析模式会覆盖此设置。`
            }), z({
                id: `FullLengthChapters`,
                label: `章节不受时长限制约束`,
                description: `当标记超出其他用户设置（如百分比或时长）时，允许片段一直延伸到章节末尾。`
            }), B({
                id: `AnalysisPercent`,
                label: `分析媒体的百分比`,
                min: 1,
                max: 50,
                description: `分析将限制为每个条目时长的该百分比。例如 25（默认值）会只分析每个条目的前四分之一。`
            }), B({
                id: `AnalysisLengthLimit`,
                label: `最大分析时长（分钟）`,
                min: 1,
                description: `分析将限制为每个条目时长的该分钟数。例如 10（默认值）会只分析每个条目的前 10 分钟。`
            }), t, G(`MinimumRecapDuration`, `MaximumRecapDuration`, `最短回述（Recap）时长（秒）`, `最长回述（Recap）时长（秒）`, `短于此时长的回述章节不会被判定为回述（Recap）。`, `长于此时长的回述章节不会被判定为回述（Recap）。`), G(`MinimumRecapDetectionDuration`, `MaximumRecapDetectionDuration`, `最短可检测回述时长（秒）`, `最长可检测回述时长（秒）`, `短于此时长的黑帧/Chromaprint 回述不会被检测到。`, `长于此时长的黑帧/Chromaprint 回述将被截断或忽略。`), G(`MinimumIntroDuration`, `MaximumIntroDuration`, `最短片头（Intro）时长（秒）`, `最长片头（Intro）时长（秒）`, `短于此时长的片段或听感相似的音频不会被判定为片头（Intro）。`, `长于此时长的片段或听感相似的音频不会被判定为片头（Intro）。`), G(`MinimumCreditsDuration`, `MaximumCreditsDuration`, `最短片尾（Credits）时长（秒）`, `最长片尾（Credits）时长（秒）`, `短于此时长的片段或听感相似的音频不会被判定为片尾（Credits）。`, `长于此时长的片段或听感相似的音频不会被判定为片尾（Credits）。`), B({
                id: `MaximumMovieCreditsDuration`,
                label: `最大电影片尾时长（秒）`,
                min: 1,
                description: `长于此时长的片段不会被判定为电影片尾。`
            }), G(`MinimumPreviewDuration`, `MaximumPreviewDuration`, `最短预告（Preview）时长（秒）`, `最长预告（Preview）时长（秒）`, `短于此时长的片段不会被判定为预告（Preview）。`, `长于此时长的片段不会被判定为预告（Preview）。`, n), G(`MinimumCommercialDuration`, `MaximumCommercialDuration`, `最短广告（Commercial）时长（秒）`, `最长广告（Commercial）时长（秒）`, `短于此时长的片段不会被判定为广告（Commercial）。`, `长于此时长的片段不会被判定为广告（Commercial）。`, n))
        }
    };

    function He(e, ...t) {
        let n = s(`fieldset`),
            r = s(`legend`, {}, e);
        n.append(r);
        for (let e of t) n.append(e);
        return n
    }
    var Ue = {
            id: `detection`,
            label: `检测`,
            render(e) {
                let t = () => F.get(`AdjustIntroBasedOnSilence`) === !0;
                L(e, z({
                    id: `AdjustIntroBasedOnSilence`,
                    label: `启用静音检测`,
                    description: `开启后，片段端点会调整到最近的静音点。`
                }), B({
                    id: `SilenceDetectionMaximumNoise`,
                    label: `噪音容限`,
                    min: -90,
                    max: 0,
                    description: `以负分贝表示的噪音容限。`,
                    visible: t
                }), B({
                    id: `SilenceDetectionMinimumDuration`,
                    label: `最短静音时长`,
                    min: 0,
                    step: .01,
                    description: `调整片头结束时间前要求的最短静音时长（秒）。`,
                    visible: t
                }), z({
                    id: `SnapToKeyframe`,
                    label: `启用关键帧吸附`,
                    description: `开启后，片段端点会吸附到最近的视频关键帧，使跳过时的画面切换更平滑。`
                }), z({
                    id: `AdjustIntroBasedOnChapters`,
                    label: `启用章节吸附`,
                    description: `开启后，片段的起止时间会吸附到最近的章节边界。`
                }), B({
                    id: `AdjustWindowInward`,
                    label: `调节窗口（向内）`,
                    min: 0,
                    description: `向片段内部搜索调节点（如章节边界、静音或关键帧）的最大秒数。用于收紧片段边界。`
                }), B({
                    id: `AdjustWindowOutward`,
                    label: `调节窗口（向外）`,
                    min: 0,
                    description: `向片段外部搜索调节点（如章节边界、静音或关键帧）的最大秒数。用于扩展片段边界。`
                }), B({
                    id: `EndSnapThreshold`,
                    label: `吸附到剧集首/尾的阈值`,
                    min: 0,
                    description: `若片段起点或终点距剧集起点或终点在此秒数内，将自动调整（吸附）到剧集边界。设为 0 关闭吸附。`
                }), z({
                    id: `SkipFirstEpisode`,
                    label: `忽略每季首集的片头`
                }), z({
                    id: `SkipFirstEpisodeAnime`,
                    label: `仅对动漫季忽略首集片头`,
                    description: `勾选后，上面的“忽略首集片头”选项仅适用于动漫季。`,
                    visible: () => F.get(`SkipFirstEpisode`) === !0
                }), z({
                    id: `AnimePreviewFromCreditsEnd`,
                    label: `将片尾后的内容作为动漫预告`,
                    description: `开启后，对于未检测到预告的动漫，会把从片尾结束到剧集结束的时间创建为预告片段。`
                }), He(`片段偏移调节`, B({
                    id: `IntroStartOffset`,
                    label: `片头开始偏移（秒）`,
                    min: 0,
                    step: .5,
                    description: `默认值：0。示例：设为 3 时，跳过前会先播放片头的前 3 秒。`
                }), z({
                    id: `IncludeIntroStartOffsetWhenSnapping`,
                    label: `吸附到剧集开头时计入开始偏移`,
                    description: `开启后，当检测到的片头起点被吸附到剧集开头时，同样会应用“片头开始偏移”。`
                }), B({
                    id: `IntroEndOffset`,
                    label: `片头结束偏移（秒）`,
                    min: 0,
                    step: .5,
                    description: `默认值：0。示例：设为 3 时，会在片头结束前 3 秒恢复播放。`
                })))
            }
        },
        K = () => F.get(`UseLegacyBlackFrameAnalyzer`) === !0,
        We = {
            id: `black-frame`,
            label: `黑帧`,
            render(e) {
                L(e, z({
                    id: `DetectRecapUsingBlackFrames`,
                    label: `用黑帧检测回述`,
                    description: `当回述章节检测失败时，在回述时长限制内、片头之前，把从 0:00 到最近检测到的黑帧标记为回述。`
                }), z({
                    id: `RefineCreditsBoundary`,
                    label: `精修片尾边界`,
                    description: `使用逐帧分析定位精确的片尾边界。关闭可加快分析（仅有关键帧精度）。`,
                    visible: () => !K()
                }), z({
                    id: `DetectNonBlackCredits`,
                    label: `检测非黑帧片尾`,
                    description: `当黑帧扫描一无所获时，也检测显示在近似纯色画面（黑色、白色、灰色或低饱和底色上的文字）上的片尾。高饱和的鲜艳背景不在检测范围。黑帧检测本身不变，此项只是补上原本会漏掉的匹配。`,
                    visible: () => !K()
                }), z({
                    id: `UseChapterMarkersBlackFrame`,
                    label: `用章节标记检测片尾`,
                    description: `开启后，将借助章节标记识别片尾片段：在章节标记附近寻找黑帧来判断片尾。`,
                    visible: K
                }), B({
                    id: `BlackFrameMinimumPercentage`,
                    label: `黑像素最小占比`,
                    min: 0,
                    max: 100,
                    description: `一帧被判定为黑帧所需的黑像素最小百分比。默认 85。`
                }), B({
                    id: `BlackFrameThreshold`,
                    label: `黑帧阈值`,
                    min: 16,
                    max: 255,
                    description: `像素值低于该阈值即视为黑色。默认 32。`
                }))
            }
        },
        Ge = 180;

    function Ke(e) {
        let t = s(`div`, {
                className: `input-container`
            }),
            n = `field-` + e.id,
            r = s(`label`, {
                className: `input-label`
            }, e.label);
        r.setAttribute(`for`, n), t.append(r);
        let i = {
            type: `text`,
            id: n,
            name: e.id,
            autocomplete: `off`
        };
        e.placeholder && (i.placeholder = e.placeholder);
        let a = s(`input`, i);
        t.append(a);
        let o = s(`div`, {
            className: `field-error`
        });
        t.append(o);
        let c = R(t, {
                ...e,
                idBase: n
            }),
            l = e.id;
        I({
            container: t,
            input: a,
            fieldOpts: e,
            errorDiv: o,
            describedByIds: c,
            onLoaded: () => {
                a.value = String(F.get(l))
            }
        });
        let u = null;
        return a.addEventListener(`input`, () => {
            u && clearTimeout(u), u = setTimeout(() => {
                F.set(l, a.value), e.onChange?.(a.value)
            }, Ge)
        }), t
    }
    var qe = {
        ChapterAnalyzerIntroductionPattern: `(^|\\s)(Intro|Introduction|OP|Opening)(?![\\s:]+End)(\\s|:|$)`,
        ChapterAnalyzerEndCreditsPattern: `(^|\\s)(Credits?|ED|Ending|Outro)(?![\\s:]+End)(\\s|:|$)`,
        ChapterAnalyzerPreviewPattern: `(^|\\s)(Preview|PV|Sneak\\s?Peek|Coming\\s?(Up|Soon)|Next\\s+(time|on|episode)|Extra|Teaser|Trailer)(?![\\s:]+End)(\\s|:|$)`,
        ChapterAnalyzerRecapPattern: `(^|\\s)(Re?cap|Sum{1,2}ary|Prev(ious(ly)?)?|(Last|Earlier)(\\s\\w+)?|Catch[ -]up)(?![\\s:]+End)(\\s|:|$)`,
        ChapterAnalyzerCommercialPattern: `(^|\\s)(Ad(vert(isement)?)?|Commercial|Intermission)(?![\\s:]+End)(\\s|:|$)`
    };

    function q(e, t, n) {
        let r = s(`div`, {
                className: `pattern-field`
            }),
            i = qe[e];
        r.append(Ke({
            id: e,
            label: t,
            placeholder: i,
            description: `输入用于检测` + n + `章节的正则表达式。<br/>默认值：<code>` + i + `</code>`
        }));
        let a = s(`button`, {
            className: `action-button reset-button`,
            type: `button`
        }, `Reset to default`);
        return a.addEventListener(`click`, () => {
            F.set(e, qe[e])
        }), r.append(a), r
    }
    var Je = {
        id: `chapters`,
        label: `章节`,
        render(e) {
            L(e, q(`ChapterAnalyzerIntroductionPattern`, `片头`, `片头`), q(`ChapterAnalyzerEndCreditsPattern`, `片尾`, `片尾`), q(`ChapterAnalyzerPreviewPattern`, `预告`, `预告`), q(`ChapterAnalyzerRecapPattern`, `回述`, `回述`), q(`ChapterAnalyzerCommercialPattern`, `广告`, `广告`), z({
                id: `EnableSponsorBlockChapterDetection`,
                label: `启用 SponsorBlock 章节检测`,
                description: `除上述正则外，同时检测已知的 SponsorBlock 章节标签。`
            }))
        }
    };

    function Ye(e) {
        let t = s(`div`, {
                className: `select-container`
            }),
            n = `field-` + e.id,
            r = s(`label`, {
                className: `select-label`
            }, e.label);
        r.setAttribute(`for`, n), t.append(r);
        let i = s(`select`, {
            id: n,
            name: e.id
        });
        for (let t of e.options) {
            let e = s(`option`, {
                value: t.value
            }, t.label);
            i.append(e)
        }
        t.append(i);
        let a = R(t, {
                ...e,
                idBase: n
            }),
            o = e.id;
        return I({
            container: t,
            input: i,
            fieldOpts: e,
            describedByIds: a,
            onLoaded: () => {
                i.value = String(F.get(o))
            }
        }), i.addEventListener(`change`, () => {
            F.set(o, i.value), e.onChange?.(i.value)
        }), t
    }
    var Xe = {
        id: `ffmpeg`,
        label: `FFmpeg`,
        render(e) {
            L(e, B({
                id: `MaxParallelism`,
                label: `最大并行度`,
                min: 1,
                description: `同时进行的异步剧集分析任务数量上限。`
            }), Ye({
                id: `ProcessPriority`,
                label: `FFmpeg 优先级`,
                options: [{
                    value: `Idle`,
                    label: `空闲`
                }, {
                    value: `BelowNormal`,
                    label: `低于正常`
                }, {
                    value: `Normal`,
                    label: `正常`
                }, {
                    value: `AboveNormal`,
                    label: `高于正常`
                }, {
                    value: `High`,
                    label: `高`
                }, {
                    value: `RealTime`,
                    label: `最高（实时）`
                }],
                description: `设置分析 FFmpeg 进程相对其他并行操作的优先级。`
            }), B({
                id: `ProcessThreads`,
                label: `FFmpeg 线程数`,
                min: 0,
                max: 16,
                description: `FFmpeg 操作使用的并发进程数。设为 0（默认）使用可用线程的最大值。`
            }), z({
                id: `ProbeAudioDuration`,
                label: `探测片尾音频时长`,
                description: `使用 ffprobe：当容器时长大于音频时长时，以第一条音频流时长作为片尾指纹依据。`
            }), Ke({
                id: `PreferredAudioLanguage`,
                label: `首选音轨语言`,
                placeholder: `eng`,
                description: `生成 Chromaprint 指纹时优先使用带此语言标记的音轨。留空或未匹配到时会使用下方的音轨选择策略。`
            }), z({
                id: `PreferAudioStreamWithMostChannels`,
                label: `优先选择声道数最多的音轨`,
                description: `开启时，Chromaprint 按声道数选择音轨，同数时取索引最小者。关闭时选择第一条音轨。`
            }), Ye({
                id: `CacheCompressionLevel`,
                label: `缓存压缩级别`,
                options: [{
                    value: `NoCompression`,
                    label: `不压缩`
                }, {
                    value: `Fastest`,
                    label: `最快`
                }, {
                    value: `Optimal`,
                    label: `均衡`
                }, {
                    value: `SmallestSize`,
                    label: `最小体积`
                }],
                description: `控制检测缓存的 Brotli 压缩级别。压缩越高越省磁盘，但会增加分析时的 CPU 消耗。修改仅影响新写入的缓存。`
            }))
        }
    };

    function Ze(e) {
        let t = Math.floor(e / 3600),
            n = Math.floor(e % 3600 / 60),
            r = Math.floor(e % 60),
            i = Math.floor((e - Math.floor(e)) * 1e3),
            a = [];
        return t > 0 && a.push(t + `h`), n > 0 && a.push(n + `m`), (r > 0 || a.length === 0 && i === 0) && a.push(r + `s`), i > 0 && a.push(i + `ms`), a.join(` `)
    }

    function Qe(e) {
        let t = e.trim();
        if (!t) return null;
        let n = t.split(`:`);
        if (n.length > 3) return null;
        let r = 0;
        for (let [e, t] of n.entries()) {
            if (!(e === n.length - 1 ? /^\d+(\.\d+)?$/ : /^\d+$/).test(t)) return null;
            let i = Number(t);
            if (e > 0 && i >= 60) return null;
            r = r * 60 + i
        }
        return Number.isFinite(r) ? r : null
    }

    function J(e) {
        let t = Math.round(e * 1e3),
            n = Math.floor(t / 36e5);
        t -= n * 36e5;
        let r = Math.floor(t / 6e4);
        t -= r * 6e4;
        let i = t / 1e3,
            a = (i < 10 ? `0` : ``) + String(i);
        return n > 0 ? n + `:` + String(r).padStart(2, `0`) + `:` + a : r + `:` + a
    }
    async function $e(e, t, n) {
        let r = Array.from({
                length: e.length
            }),
            i = 0;
        async function a() {
            for (;;) {
                let t = i;
                if (i += 1, t >= e.length) return;
                r[t] = await n(e[t], t)
            }
        }
        let o = Math.min(t, e.length);
        return await Promise.all(Array.from({
            length: o
        }, () => a())), r
    }

    function et(e) {
        return new Promise(t => setTimeout(t, e))
    }
    var tt = 6;

    function nt() {
        return ve()
    }

    function rt(e, t) {
        return ye(e, t)
    }

    function it(e) {
        return be(e)
    }
    async function at(e, t) {
        let n = await xe(e, t);
        if (n.length === 0) return {
            episodes: [],
            segments: [],
            disabledItemIds: []
        };
        let [r, i] = await Promise.all([$e(n, tt, e => y(e.Id)), st(t)]);
        return {
            episodes: n,
            segments: r,
            disabledItemIds: i
        }
    }

    function ot(e) {
        return y(e)
    }
    async function st(e) {
        let t = await T(e);
        return t.ok && t.data ? t.data : null
    }

    function ct(e, t) {
        return E(e, t)
    }

    function lt() {
        let e = !1,
            t = 0,
            n = 0,
            r = 0,
            i = {
                view: `libraries`
            },
            a = new Map,
            o = new Map;

        function s() {
            return t += 1, n += 1, t
        }

        function c() {
            return n += 1, n
        }

        function l(n) {
            return !e && n === t
        }

        function u(t) {
            return !e && t === n
        }

        function d() {
            return !e
        }

        function f() {
            r === 0 && window.Dashboard.showLoadingMsg(), r += 1
        }

        function p() {
            r !== 0 && (--r, r === 0 && window.Dashboard.hideLoadingMsg())
        }

        function m() {
            r !== 0 && (r = 0, window.Dashboard.hideLoadingMsg())
        }

        function h(e, t, n, r) {
            let i = a.get(e);
            if (i) return n?.(v(i.length)), Promise.resolve(i);
            let s = o.get(e);
            if (s) return s;
            let c = rt(e, t).then(t => d() ? (a.set(e, t), n?.(v(t.length)), t) : []).catch(e => {
                throw d() && r?.(), e
            }).finally(() => {
                o.delete(e)
            });
            return o.set(e, c), c
        }

        function g(e) {
            return a.get(e)
        }

        function _() {
            return Array.from(a.values()).flat()
        }

        function v(e) {
            return e === 1 ? `1 个条目` : e + ` 个条目`
        }

        function y() {
            return i
        }

        function b(e) {
            i = e
        }

        function x() {
            e = !0, t += 1, n += 1, m()
        }
        return {
            getState: y,
            setState: b,
            destroy: x,
            nextViewVersion: s,
            nextPanelVersion: c,
            isCurrentView: l,
            isCurrentPanel: u,
            isAlive: d,
            showDashboardLoading: f,
            hideDashboardLoading: p,
            ensureLibraryShows: h,
            getCachedShows: g,
            getAllCachedShows: _
        }
    }
    var ut = 150,
        dt = 0;

    function ft(e) {
        let t = s(`div`, {
                className: `ts-top-bar`
            }),
            n = s(`nav`, {
                className: `ts-breadcrumbs-nav`,
                "aria-label": `Breadcrumb`
            }),
            r = s(`ol`, {
                className: `ts-breadcrumbs`
            });
        n.append(r);
        let i = s(`div`, {
                className: `ts-search-wrapper`
            }),
            a = s(`span`, {
                className: `ts-search-icon`
            }, `⌕`);
        a.setAttribute(`aria-hidden`, `true`);
        let o = s(`input`, {
            className: `ts-search-input`,
            type: `search`,
            placeholder: `Search all shows…`
        });
        o.setAttribute(`aria-label`, `Search all shows`), o.setAttribute(`autocomplete`, `off`), o.setAttribute(`name`, `show-search`), o.setAttribute(`role`, `combobox`), o.setAttribute(`aria-autocomplete`, `list`), o.setAttribute(`aria-haspopup`, `listbox`);
        let c = s(`div`, {
            className: `ts-search-results`
        });
        c.id = `ts-show-search-results-` + String(++dt), c.setAttribute(`role`, `listbox`), c.setAttribute(`aria-label`, `Search results`), o.setAttribute(`aria-controls`, c.id), o.setAttribute(`aria-expanded`, `false`), i.append(a, o, c), t.append(n, i);
        let l = e.allShows,
            u = [],
            d = -1;

        function f() {
            d = -1, o.removeAttribute(`aria-activedescendant`);
            for (let e of u) e.element.classList.remove(`active`), e.element.setAttribute(`aria-selected`, `false`)
        }

        function p() {
            c.classList.remove(`open`), o.setAttribute(`aria-expanded`, `false`), f()
        }

        function m() {
            c.classList.add(`open`), o.setAttribute(`aria-expanded`, `true`)
        }

        function h(e) {
            if (u.length === 0) {
                f();
                return
            }
            d = Math.max(0, Math.min(e, u.length - 1));
            for (let e = 0; e < u.length; e++) {
                let t = e === d;
                u[e].element.classList.toggle(`active`, t), u[e].element.setAttribute(`aria-selected`, String(t))
            }
            let t = u[d];
            o.setAttribute(`aria-activedescendant`, t.id), t.element.scrollIntoView({
                block: `nearest`
            })
        }

        function g(t) {
            o.value = ``, p(), e.onSearchSelect(t)
        }

        function _(e) {
            r.replaceChildren(), e.forEach((t, n) => {
                let i = s(`li`, {
                    className: `ts-breadcrumb-item`
                });
                n > 0 && i.append(s(`span`, {
                    className: `ts-breadcrumb-sep`
                }, `›`));
                let a = n === e.length - 1;
                if (a || !t.onClick) {
                    let e = s(`span`, {
                        className: `ts-breadcrumb-current`
                    }, t.label);
                    a && e.setAttribute(`aria-current`, `page`), i.append(e)
                } else {
                    let e = s(`button`, {
                        className: `ts-breadcrumb-link`,
                        type: `button`
                    }, t.label);
                    e.addEventListener(`click`, () => t.onClick?.()), i.append(e)
                }
                r.append(i)
            })
        }

        function v(e, t) {
            let n = `ts-search-result-` + String(u.length + 1),
                r = s(`div`, {
                    className: `ts-search-result`,
                    id: n
                }, t);
            r.setAttribute(`role`, `option`), r.setAttribute(`aria-selected`, `false`);
            let i = u.length;
            r.addEventListener(`mousemove`, () => {
                h(i)
            }), r.addEventListener(`mousedown`, e => {
                e.preventDefault()
            }), r.addEventListener(`click`, () => {
                g(e)
            }), u.push({
                id: n,
                show: e,
                element: r
            }), c.append(r)
        }

        function y(e) {
            if (c.replaceChildren(), u = [], f(), !e.trim()) {
                p();
                return
            }
            let t = e.toLowerCase(),
                n = l.filter(e => e.Name.toLowerCase().includes(t));
            if (n.length === 0) {
                c.append(s(`div`, {
                    className: `ts-search-empty`,
                    role: `status`
                }, `未找到剧集。`)), m();
                return
            }
            let r = {};
            for (let e of n) {
                let t = e.LibraryName;
                r[t] || (r[t] = []), r[t].push(e)
            }
            for (let e of Object.keys(r)) {
                c.append(s(`div`, {
                    className: `ts-search-group-label`
                }, e));
                for (let t of r[e]) {
                    let e = t.ProductionYear ? ` (` + t.ProductionYear + `)` : ``;
                    v(t, t.Name + e)
                }
            }
            m(), h(0)
        }
        let b = null,
            x = () => {
                b && clearTimeout(b), b = setTimeout(() => {
                    y(o.value)
                }, ut)
            };
        o.addEventListener(`input`, x);
        let S = e => {
                if (e.key === `ArrowDown`) {
                    if (!o.value.trim()) return;
                    c.classList.contains(`open`) || y(o.value), u.length > 0 && (e.preventDefault(), h(d < 0 ? 0 : d + 1))
                } else if (e.key === `ArrowUp`) {
                    if (!c.classList.contains(`open`) || u.length === 0) return;
                    e.preventDefault(), h(d - 1)
                } else if (e.key === `Home`) {
                    if (!c.classList.contains(`open`) || u.length === 0) return;
                    e.preventDefault(), h(0)
                } else if (e.key === `End`) {
                    if (!c.classList.contains(`open`) || u.length === 0) return;
                    e.preventDefault(), h(u.length - 1)
                } else if (e.key === `Enter`) {
                    if (!c.classList.contains(`open`) || d < 0) return;
                    e.preventDefault(), g(u[d].show)
                } else e.key === `Escape` && p()
            },
            C = e => {
                let t = e.relatedTarget;
                (!(t instanceof Node) || !i.contains(t)) && p()
            },
            w = () => {
                o.value.trim() && y(o.value)
            };
        return o.addEventListener(`keydown`, S), i.addEventListener(`focusout`, C), o.addEventListener(`focus`, w), _(e.segments), {
            container: t,
            updateSegments(e) {
                _(e)
            },
            updateShows(e) {
                l = e, o.value.trim() && y(o.value)
            },
            destroy() {
                b &&= (clearTimeout(b), null), o.removeEventListener(`input`, x), o.removeEventListener(`keydown`, S), o.removeEventListener(`focus`, w), i.removeEventListener(`focusout`, C), p()
            }
        }
    }

    function pt(e) {
        let t = s(`div`, {
            className: `ts-season-bar`
        });
        return mt(t, e), {
            container: t
        }
    }

    function mt(e, t) {
        let n = !1;
        e.append(s(`div`, {
            className: `ts-season-spacer`
        }));
        let r = s(`button`, {
            className: `ts-manage-toggle`,
            type: `button`
        }, `⚙ Manage`);
        r.setAttribute(`aria-label`, `切换管理面板`), r.setAttribute(`aria-expanded`, `false`), t.managePanelId && r.setAttribute(`aria-controls`, t.managePanelId), r.addEventListener(`click`, () => {
            n = !n, r.setAttribute(`aria-expanded`, String(n)), t.onManageToggle(n)
        }), e.append(r)
    }
    var ht = 0;

    function gt(e) {
        let t = s(`div`, {
            className: `ts-season-bar`
        });
        t.setAttribute(`role`, `tablist`), t.setAttribute(`aria-label`, `Seasons`);
        let n = ++ht,
            r = [],
            i = new Map,
            a = new Map;

        function o(e) {
            return a.get(e) ?? null
        }

        function c(e) {
            for (let [t, n] of i) {
                let r = t === e;
                n.classList.toggle(`active`, r), n.setAttribute(`aria-selected`, String(r)), n.tabIndex = r ? 0 : -1
            }
        }

        function l(t, n = !1) {
            c(t.Id), n && i.get(t.Id)?.focus(), e.onSeasonSelect(t)
        }

        function u(e, t) {
            let n = r.findIndex(t => t.Id === e);
            if (n === -1 || r.length === 0) return;
            let i = (n + t + r.length) % r.length;
            l(r[i], !0)
        }

        function d(e) {
            if (r.length === 0) return;
            let t = Math.max(0, Math.min(e, r.length - 1));
            l(r[t], !0)
        }

        function f(e, t) {
            e.key === `ArrowRight` || e.key === `ArrowDown` ? (e.preventDefault(), u(t.Id, 1)) : e.key === `ArrowLeft` || e.key === `ArrowUp` ? (e.preventDefault(), u(t.Id, -1)) : e.key === `Home` ? (e.preventDefault(), d(0)) : e.key === `End` && (e.preventDefault(), d(r.length - 1))
        }

        function p(o, c) {
            r = o, t.replaceChildren(), i.clear(), a.clear();
            for (let r = 0; r < o.length; r++) {
                let u = o[r],
                    d = u.IndexNumber == null ? u.Name : `S` + u.IndexNumber,
                    p = u.Id === c,
                    m = `ts-season-tab-` + n + `-` + String(r + 1),
                    h = s(`button`, {
                        className: `ts-season-tab` + (p ? ` active` : ``),
                        id: m,
                        type: `button`
                    }, d);
                h.title = u.Name, h.setAttribute(`role`, `tab`), h.setAttribute(`aria-selected`, String(p)), h.tabIndex = p ? 0 : -1, e.panelId && h.setAttribute(`aria-controls`, e.panelId), h.addEventListener(`click`, () => {
                    l(u)
                }), h.addEventListener(`keydown`, e => {
                    f(e, u)
                }), i.set(u.Id, h), a.set(u.Id, m), t.append(h)
            }
            mt(t, {
                managePanelId: e.managePanelId,
                onManageToggle: e.onManageToggle
            })
        }
        return p(e.seasons, e.activeSeasonId), {
            container: t,
            setActive(e) {
                c(e)
            },
            getTabId: o
        }
    }
    var Y = [{
            value: `Introduction`,
            label: `片头（Intro）`
        }, {
            value: `Credits`,
            label: `片尾（Credits）`
        }, {
            value: `Recap`,
            label: `回述（Recap）`
        }, {
            value: `Preview`,
            label: `预告（Preview）`
        }, {
            value: `Commercial`,
            label: `广告（Commercial）`
        }],
        _t = new Map(Y.map((e, t) => [e.value, t]));

    function vt(e) {
        switch (e.Source) {
            case `User`:
                return `用户`;
            case `Chapter`:
                return `章节`;
            case `Chromaprint`:
                return `音频`;
            case `BlackFrame`:
                return `黑帧`;
            case `CreditsDerived`:
                return `派生`;
            default:
                return e.Source.toLowerCase()
        }
    }

    function yt(e) {
        return [...e].sort((e, t) => (_t.get(e.Type) ?? 99) - (_t.get(t.Type) ?? 99) || e.Start - t.Start)
    }

    function bt(e, t, n) {
        let r = Qe(e.value),
            i = Qe(t.value);
        return r === null || i === null ? (n.textContent = `请输入时间，如 95.5 或 1:35.5`, null) : i <= r ? (n.textContent = `结束时间必须晚于开始时间`, null) : (n.textContent = ``, {
            start: r,
            end: i
        })
    }

    function xt(e) {
        let t = s(`div`, {
                className: `ts-segment-editor`
            }),
            n = s(`div`),
            r = u({
                className: `ts-segment-status`,
                display: `block`
            }),
            i = !1,
            a = !1,
            o = e.initialSegments,
            c = [];

        function l(e, t = `var(--is-text-muted)`) {
            i || r.show(e, t)
        }
        async function d(e) {
            if (!a) {
                a = !0;
                try {
                    await e()
                } finally {
                    a = !1
                }
            }
        }
        async function f(t, n, r) {
            let a = await y(e.itemId);
            if (i) return;
            let o = a.ok ? a.data ?? [] : n;
            g(o), e.onChanged(o), a.ok ? l(t + p(o, r), `var(--is-success)`) : l(t + ` 重新加载失败，当前显示未校验的本地结果。`, `var(--is-error)`)
        }

        function p(e, t) {
            return t && e.some(e => e.Type === t.type && e.Id !== t.excludeId && !e.Suppressed && t.start < e.End && e.Start < t.end) ? ` 警告：与另一 ` + t.type + ` 片段重叠。` : ``
        }

        function m(t) {
            let n = s(`div`, {
                    className: `ts-segment-row` + (t.Suppressed ? ` suppressed` : ``)
                }),
                r = Y.find(e => e.value === t.Type)?.label ?? t.Type;
            n.append(s(`span`, {
                className: `ts-segment-mode`
            }, r));
            let u = s(`input`, {
                className: `ts-segment-input`,
                type: `text`,
                value: J(t.Start)
            });
            u.setAttribute(`aria-label`, r + ` 开始时间`);
            let p = s(`input`, {
                className: `ts-segment-input`,
                type: `text`,
                value: J(t.End)
            });
            p.setAttribute(`aria-label`, r + ` 结束时间`);
            let m = s(`span`, {
                    className: `ts-pill-source`
                }, vt(t)),
                h = s(`span`, {
                    className: `ts-segment-error`
                });
            if (t.Suppressed) {
                u.disabled = !0, p.disabled = !0;
                let r = s(`button`, {
                    className: `ts-segment-btn`,
                    type: `button`
                }, `还原`);
                return r.addEventListener(`click`, () => d(async () => {
                    let n = await C(e.itemId, t.Id);
                    i || (n.ok ? await f(`片段已还原。`, o.map(e => e.Id === t.Id ? {
                        ...e,
                        Suppressed: !1
                    } : e)) : l(n.error ?? `还原片段失败`, `var(--is-error)`))
                })), n.append(u, p, m, s(`span`, {
                    className: `ts-segment-hint`
                }, `hidden`), r, h), n
            }
            c.push(() => u.value !== J(t.Start) || p.value !== J(t.End));
            let g = s(`button`, {
                    className: `ts-segment-btn`,
                    type: `button`
                }, `保存`),
                _ = s(`button`, {
                    className: `ts-segment-btn danger`,
                    type: `button`
                }, `删除`);
            return g.addEventListener(`click`, () => d(async () => {
                let n = bt(u, p, h);
                if (n === null) return;
                let r = await x(e.itemId, t.Id, {
                    Start: n.start,
                    End: n.end
                });
                i || (r.ok ? await f(`片段已保存。`, o.map(e => e.Id === t.Id ? {
                    ...e,
                    Start: n.start,
                    End: n.end
                } : e), {
                    type: t.Type,
                    start: n.start,
                    end: n.end,
                    excludeId: t.Id
                }) : h.textContent = r.error ?? `保存片段失败`)
            })), _.addEventListener(`click`, async () => {
                a || !await U({
                    title: `删除片段`,
                    body: t.Source === `User` ? `这会永久删除该片段。` : `这会隐藏自动检测出的片段；重新分析不会再次加入它。擦除时间戳可恢复自动检测。`,
                    confirmLabel: `确认删除`
                }) || i || await d(async () => {
                    let n = await S(e.itemId, t.Id);
                    i || (n.ok ? await f(`片段已删除。`, t.Source === `User` ? o.filter(e => e.Id !== t.Id) : o.map(e => e.Id === t.Id ? {
                        ...e,
                        Suppressed: !0
                    } : e)) : l(n.error ?? `删除片段失败`, `var(--is-error)`))
                })
            }), n.append(u, p, m, g, _, h), n
        }

        function h() {
            let t = s(`div`, {
                    className: `ts-segment-row ts-segment-add-row`
                }),
                n = s(`select`, {
                    className: `ts-segment-select`
                });
            for (let e of Y) n.append(s(`option`, {
                value: e.value
            }, e.label));
            n.setAttribute(`aria-label`, `新片段类型`);
            let r = s(`input`, {
                className: `ts-segment-input`,
                type: `text`,
                placeholder: `开始`
            });
            r.setAttribute(`aria-label`, `新片段开始`);
            let a = s(`input`, {
                className: `ts-segment-input`,
                type: `text`,
                placeholder: `结束`
            });
            a.setAttribute(`aria-label`, `新片段结束`);
            let l = s(`span`, {
                    className: `ts-segment-error`
                }),
                u = s(`button`, {
                    className: `ts-segment-btn`,
                    type: `button`
                }, `添加`);
            return c.push(() => r.value.trim() !== `` || a.value.trim() !== ``), u.addEventListener(`click`, () => d(async () => {
                let t = bt(r, a, l);
                if (t === null) return;
                let s = n.value,
                    c = await b(e.itemId, {
                        Type: s,
                        Start: t.start,
                        End: t.end
                    });
                if (!i)
                    if (c.ok) {
                        let e = c.data;
                        await f(`片段已添加。`, e ? [...o, e] : o, {
                            type: s,
                            start: t.start,
                            end: t.end,
                            excludeId: e?.Id
                        })
                    } else l.textContent = c.error ?? `添加片段失败`
            })), t.append(n, r, a, u, l), t
        }

        function g(e) {
            o = e, c = [], n.replaceChildren();
            for (let t of yt(e)) n.append(m(t));
            n.append(h())
        }
        return t.append(n, r.element), g(e.initialSegments), {
            container: t,
            isDirty() {
                return !i && c.some(e => e())
            },
            destroy() {
                i = !0, t.replaceChildren()
            }
        }
    }
    var St = 120;

    function Ct() {
        let e = s(`div`),
            t = s(`div`, {
                className: `ts-filter-bar`
            }),
            n = s(`input`, {
                className: `ts-filter-input`,
                type: `text`,
                placeholder: `筛选剧集…`,
                name: `episode-filter`
            });
        n.setAttribute(`aria-label`, `按名称筛选剧集`), n.setAttribute(`autocomplete`, `off`);
        let r = s(`span`, {
            className: `ts-episode-count`
        });
        r.setAttribute(`aria-live`, `polite`), t.append(n, r);
        let i = s(`div`, {
            className: `ts-status-msg`
        });
        i.style.display = `none`, i.setAttribute(`aria-live`, `polite`);
        let a = s(`div`);
        e.append(t, i, a);
        let o = [],
            c = [],
            l = null,
            u = [],
            d = 0;

        function f(e) {
            return e ? Math.round(e / 1e7 / 60) + `\xA0min` : ``
        }
        let p = !1,
            m = new Set,
            h = null;

        function g(e, t, n) {
            let r = s(`div`, {
                    className: `ts-episode-card`
                }),
                i = s(`img`, {
                    className: `ts-episode-thumb`,
                    src: Se(e.Id),
                    alt: ``,
                    width: `64`,
                    height: `38`
                });
            i.loading = `lazy`, i.onerror = () => {
                i.style.display = `none`
            }, r.append(i);
            let a = s(`div`, {
                    className: `ts-episode-info`
                }),
                o = s(`div`, {
                    className: `ts-episode-header`
                }),
                c = p ? `` : (e.IndexNumber ?? n + 1).toLocaleString(void 0, {
                    minimumIntegerDigits: 2
                }) + `: `;
            o.append(s(`span`, {
                className: `ts-episode-name`
            }, c + e.Name));
            let l = f(e.RunTimeTicks);
            if (l && o.append(s(`span`, {
                    className: `ts-episode-runtime`
                }, l)), h && v(e, r, o), a.append(o), !t || !t.ok) {
                r.classList.add(`error`);
                let t = s(`div`, {
                    className: `ts-episode-error`
                });
                t.append(document.createTextNode(`加载片段失败`));
                let n = s(`button`, {
                    className: `ts-retry-link`,
                    type: `button`
                }, `重试`);
                n.setAttribute(`aria-label`, `重新加载 ` + e.Name + ` 的片段`), n.addEventListener(`click`, async () => {
                    n.textContent = `加载中…`, n.disabled = !0;
                    let i = await y(e.Id);
                    i && i.ok ? (r.classList.remove(`error`), a.removeChild(t), _(e, o, a, i.data ?? [])) : (n.textContent = `重试`, n.disabled = !1)
                }), t.append(n), a.append(t)
            } else _(e, o, a, t.data ?? []);
            return r.append(a), r
        }

        function _(e, t, n, r) {
            let i = b(r);
            n.append(i);
            let a = `ts-segment-editor-` + ++d,
                o = s(`button`, {
                    className: `ts-edit-btn`,
                    type: `button`
                }, `编辑`);
            o.setAttribute(`aria-expanded`, `false`), t.append(o);
            let c = null;
            o.addEventListener(`click`, () => {
                if (!c) {
                    c = xt({
                        itemId: e.Id,
                        initialSegments: r,
                        onChanged: e => {
                            let t = b(e);
                            i.replaceWith(t), i = t
                        }
                    }), c.container.id = a, o.setAttribute(`aria-controls`, a), n.append(c.container), u.push(c), o.setAttribute(`aria-expanded`, `true`);
                    return
                }
                let t = c.container.style.display !== `none`;
                c.container.style.display = t ? `none` : ``, o.setAttribute(`aria-expanded`, String(!t))
            })
        }

        function v(e, t, n) {
            let r = s(`input`, {
                    className: `ts-episode-disable-toggle`,
                    type: `checkbox`
                }),
                i = m.has(e.Id);
            r.checked = !i, r.setAttribute(`aria-label`, `启用 ` + e.Name + ` 的片段`), r.title = `关闭后将在 Jellyfin 中隐藏该条目的检测片段`, t.classList.toggle(`ts-episode-disabled`, i), r.addEventListener(`change`, async () => {
                r.disabled = !0;
                let n = !r.checked;
                try {
                    await h?.(e.Id, n), n ? m.add(e.Id) : m.delete(e.Id), t.classList.toggle(`ts-episode-disabled`, n)
                } catch {
                    r.checked = !r.checked, window.Dashboard.alert(`更新片段设置失败`)
                } finally {
                    r.disabled = !1
                }
            }), n.append(r)
        }

        function b(e) {
            let t = s(`div`, {
                    className: `ts-episode-timestamps`
                }),
                n = yt(e.filter(e => !e.Suppressed));
            for (let e of Y) {
                let r = n.filter(t => t.Type === e.value);
                if (r.length === 0) {
                    t.append(s(`span`, {
                        className: `ts-timestamp-missing`
                    }, e.label + ` –`));
                    continue
                }
                for (let n of r) {
                    let r = s(`span`, {
                        className: `ts-timestamp-pill` + (n.Source === `User` ? ` user` : ``)
                    }, e.label + ` ` + Ze(n.Start) + ` – ` + Ze(n.End));
                    r.append(s(`span`, {
                        className: `ts-pill-source`
                    }, vt(n))), t.append(r)
                }
            }
            return t
        }

        function x() {
            let e = n.value.toLowerCase(),
                t = 0;
            if (c.forEach((n, r) => {
                    let i = o[r]?.Name?.toLowerCase() ?? ``,
                        a = !e || i.includes(e);
                    n.style.display = a ? `` : `none`, a && t++
                }), e && t === 0) {
                r.textContent = `没有匹配的剧集`;
                return
            }
            r.textContent = t + ` 集`
        }
        let S = () => {
            l && clearTimeout(l), l = setTimeout(() => {
                x()
            }, St)
        };
        n.addEventListener(`input`, S);

        function C() {
            for (let e of u) e.destroy();
            u = []
        }
        return {
            container: e,
            render(e, t, u = !1, d) {
                if (p = u, m = new Set(d?.ids), h = d?.onChange ?? null, o = e, a.replaceChildren(), C(), c = [], l && clearTimeout(l), n.value = ``, e.length === 0) {
                    a.append(s(`div`, {
                        className: `ts-status-msg`
                    }, `未找到剧集。`)), r.textContent = ``;
                    return
                }
                for (let n = 0; n < e.length; n++) {
                    let r = g(e[n], t[n] ?? null, n);
                    c.push(r), a.append(r)
                }
                r.textContent = e.length + ` 集`, i.style.display = `none`
            },
            clear() {
                a.replaceChildren(), C(), c = [], o = [], m = new Set, h = null, l && clearTimeout(l), r.textContent = ``, n.value = ``
            },
            setStatus(e, t = `var(--is-text-muted)`, n) {
                if (!e) {
                    i.style.display = `none`, i.replaceChildren();
                    return
                }
                if (i.replaceChildren(document.createTextNode(e)), n) {
                    let e = s(`button`, {
                        className: `ts-retry-link`,
                        type: `button`
                    }, n.label);
                    e.addEventListener(`click`, n.onClick), i.append(` `, e)
                }
                i.style.color = t, i.style.display = `block`
            },
            hasUnsavedEdits() {
                return u.some(e => e.isDirty())
            },
            destroy() {
                l &&= (clearTimeout(l), null), C(), n.removeEventListener(`input`, S)
            }
        }
    }
    var wt = [{
            key: `Recap`,
            label: `回述（Recap）`,
            options: [{
                value: `Default`,
                label: `默认`
            }, {
                value: `Chapter`,
                label: `章节`
            }, {
                value: `Chromaprint`,
                label: `Chromaprint`
            }, {
                value: `None`,
                label: `无`
            }]
        }, {
            key: `Introduction`,
            label: `片头（Intro）`,
            options: [{
                value: `Default`,
                label: `默认`
            }, {
                value: `Chapter`,
                label: `章节`
            }, {
                value: `Chromaprint`,
                label: `Chromaprint`
            }, {
                value: `None`,
                label: `无`
            }]
        }, {
            key: `Credits`,
            label: `片尾（Credits）`,
            options: [{
                value: `Default`,
                label: `默认`
            }, {
                value: `Chapter`,
                label: `章节`
            }, {
                value: `Chromaprint`,
                label: `Chromaprint`
            }, {
                value: `BlackFrame`,
                label: `黑帧`
            }, {
                value: `None`,
                label: `无`
            }]
        }, {
            key: `Preview`,
            label: `预告（Preview）`,
            options: [{
                value: `Default`,
                label: `默认`
            }, {
                value: `Chapter`,
                label: `章节`
            }, {
                value: `None`,
                label: `无`
            }]
        }, {
            key: `Commercial`,
            label: `广告（Commercial）`,
            options: [{
                value: `Default`,
                label: `默认`
            }, {
                value: `Chapter`,
                label: `章节`
            }, {
                value: `None`,
                label: `无`
            }]
        }],
        Tt = `ace21d44a4e54a85ae75acd2e24a9574`;

    function Et(e) {
        let t = s(`div`, {
            className: `ts-action-bar`
        });
        t.id = `ts-action-panel`;
        let n = {},
            r = s(`div`, {
                className: `ts-analyzer-group`
            });
        for (let e of wt) {
            let t = s(`div`, {
                    className: `ts-analyzer-item`
                }),
                i = `ts-analyzer-` + e.key.toLowerCase(),
                a = s(`label`, {
                    className: `ts-analyzer-label`,
                    for: i
                }, e.label),
                o = s(`select`, {
                    id: i,
                    name: `analyzer-` + e.key.toLowerCase()
                });
            for (let t of e.options) o.append(s(`option`, {
                value: t.value
            }, t.label));
            n[e.key] = o, t.append(a), t.append(o), r.append(t)
        }
        let i = s(`button`, {
                className: `ts-action-btn apply`,
                type: `button`
            }, `保存分析器覆盖`),
            a = s(`button`, {
                className: `ts-action-btn scan`,
                type: `button`
            }, `扫描季`),
            o = s(`button`, {
                className: `ts-action-btn erase`,
                type: `button`
            }, `擦除季时间戳`),
            c = s(`div`, {
                className: `ts-action-buttons`
            });
        c.append(i, a, o);
        let u = s(`div`, {
            className: `ts-action-row`
        });
        u.append(r, c);
        let f = s(`div`, {
                className: `ts-action-meta`
            }),
            p = s(`div`, {
                className: `ts-action-status`
            }),
            m = l(p, {
                display: `block`
            }),
            h = s(`a`, {
                href: `#/dashboard/plugins/ace21d44a4e54a85ae75acd2e24a9574?name=Segment Editor`
            }, `片段编辑器 →`);
        f.append(h), t.append(u, f, p);
        let g = ``,
            _ = ``,
            v = !1,
            y = !1,
            b = 0,
            x = 0;

        function S() {
            a.textContent = v ? `扫描电影` : `扫描季`, o.textContent = v ? `擦除电影时间戳` : `擦除季时间戳`
        }

        function C() {
            a.disabled = !1, S()
        }
        let T = async () => {
            if (!y) {
                m.show(`正在保存分析器覆盖…`, `var(--is-text-muted)`);
                try {
                    await d(async () => {
                        let e = {
                            Introduction: n.Introduction.value,
                            Credits: n.Credits.value,
                            Recap: n.Recap.value,
                            Preview: n.Preview.value,
                            Commercial: n.Commercial.value
                        };
                        await ee(_, e)
                    }), m.show(`分析器覆盖已更新。`, `var(--is-success)`), window.Dashboard.alert(`分析器设置已更新`)
                } catch {
                    m.show(`更新分析器覆盖失败。`, `var(--is-error)`), window.Dashboard.alert(`更新分析器设置失败`)
                }
            }
        }, E = async t => {
            let n = 1e3,
                r = 0,
                i = n;
            for (; !y && t === x && r < 300;) {
                if (await et(i), y || t !== x) return;
                r++;
                let a = await ne();
                if (y || t !== x) return;
                if (a.ok && !a.data?.isRunning) {
                    C(), m.show(`扫描完成。`, `var(--is-success)`), await Promise.resolve(e.onScanComplete());
                    return
                }
                i = a.ok ? n : Math.min(i * 2, 1e4)
            }
            y || t !== x || (C(), m.show(`扫描状态轮询超时，请刷新查看结果。`, `var(--is-warning)`), window.Dashboard.alert(`扫描状态轮询超时，请刷新查看结果。`))
        }, D = async () => {
            if (y) return;
            let e = ++x;
            a.disabled = !0, m.show(`正在开始扫描…`, `var(--is-text-muted)`);
            try {
                let t = await d(async () => te(g, v ? g : _));
                if (y || e !== x) return;
                if (t.status === 409) m.show(`已有扫描正在进行中。`, `var(--is-warning)`), window.Dashboard.alert(`已有扫描正在进行中。`);
                else if (!t.ok) {
                    C(), m.show(`无法启动扫描。`, `var(--is-error)`), window.Dashboard.alert(`无法启动扫描。`);
                    return
                }
                a.textContent = `扫描进行中…`, m.show(`扫描进行中…可能需要几分钟。`, `var(--is-text-muted)`), E(e).catch(console.error)
            } catch {
                C(), m.show(`无法启动扫描。`, `var(--is-error)`), window.Dashboard.alert(`无法启动扫描。`)
            }
        }, O = async () => {
            if (y) return;
            let t = v ? `电影` : `季`,
                n = v ? `Intros/Show/` + encodeURIComponent(g) : `Intros/Show/` + encodeURIComponent(g) + `/` + encodeURIComponent(_),
                r = await U({
                    title: `确认擦除时间戳`,
                    body: `确定要擦除该 ` + t + ` 的全部时间戳吗？`,
                    confirmLabel: `擦除`,
                    checkbox: {
                        label: `包含缓存的指纹`
                    }
                });
            if (!y && r) {
                m.show(`正在擦除时间戳…`, `var(--is-text-muted)`);
                try {
                    if (!(await re(n, r.checkboxChecked)).ok) {
                        m.show(`擦除时间戳失败。`, `var(--is-error)`), window.Dashboard.alert(`擦除时间戳失败`);
                        return
                    }
                    m.show(`时间戳已擦除。`, `var(--is-success)`), window.Dashboard.alert(`时间戳已擦除`), await Promise.resolve(e.onScanComplete())
                } catch {
                    m.show(`擦除时间戳失败。`, `var(--is-error)`), window.Dashboard.alert(`擦除时间戳失败`)
                }
            }
        };
        async function ie() {
            try {
                let e = await de();
                if (y) return;
                e.some(e => e.Id === Tt && e.Status === `Active`) && h.setAttribute(`href`, `#/configurationpage?name=Segment%20Editor`)
            } catch {}
        }
        return ie().catch(console.error), i.addEventListener(`click`, T), a.addEventListener(`click`, D), o.addEventListener(`click`, O), {
            container: t,
            toggle(e) {
                t.classList.toggle(`open`, e)
            },
            async loadForSeason(e, t, o) {
                if (y) return;
                let s = ++b;
                if (x += 1, g = e, _ = t, v = o, C(), m.clear(), r.style.display = o ? `none` : ``, i.style.display = o ? `none` : ``, !o) {
                    let e = await w(t);
                    if (y || s !== b) return;
                    let r = e.ok && e.data ? e.data : {};
                    n.Introduction.value = r.Introduction ?? `Default`, n.Credits.value = r.Credits ?? `Default`, n.Recap.value = r.Recap ?? `Default`, n.Preview.value = r.Preview ?? `Default`, n.Commercial.value = r.Commercial ?? `Default`
                }
                let c = await ne();
                y || s !== b || c.ok && c.data?.isRunning && (a.disabled = !0, a.textContent = `扫描进行中…`, m.show(`扫描进行中…可能需要几分钟。`, `var(--is-text-muted)`))
            },
            destroy() {
                y = !0, b += 1, x += 1, i.removeEventListener(`click`, T), a.removeEventListener(`click`, D), o.removeEventListener(`click`, O)
            }
        }
    }

    function Dt(e) {
        let t = s(`button`, {
                className: `ts-episode-card ts-episode-card-button`,
                type: `button`
            }),
            n = s(`div`, {
                className: `ts-episode-info`
            }),
            r = s(`div`, {
                className: `ts-episode-header`
            }),
            i = null;
        return r.append(s(`span`, {
            className: `ts-episode-name`
        }, e.title)), e.subtitle && (i = s(`span`, {
            className: `ts-episode-runtime`
        }, e.subtitle), r.append(i)), n.append(r), t.append(n), t.addEventListener(`click`, e.onClick), {
            container: t,
            subtitleEl: i
        }
    }

    function Ot(e) {
        let t = lt(),
            n = null,
            r = s(`div`),
            i = new Map,
            a = ft({
                segments: [{
                    label: `所有媒体库`
                }],
                allShows: [],
                onSearchSelect: e => {
                    v(e).catch(console.error)
                }
            }),
            o = Ct(),
            c = Et({
                onScanComplete: () => ee()
            }),
            l = s(`section`, {
                className: `ts-season-panel`,
                id: `timestamps-season-panel`
            });
        l.tabIndex = -1, l.append(c.container, o.container), e.append(a.container, r), g().catch(console.error);

        function u(e, t) {
            let n = {
                className: `ts-status-msg`
            };
            return t && (n.style = `color: ` + t), s(`div`, n, e)
        }

        function d(e) {
            e ? (l.setAttribute(`role`, `tabpanel`), l.setAttribute(`aria-labelledby`, e)) : (l.removeAttribute(`role`), l.removeAttribute(`aria-labelledby`))
        }

        function f(e) {
            l.setAttribute(`aria-busy`, String(e))
        }

        function p() {
            n = null, r.replaceChildren(), f(!1), d(null), c.toggle(!1)
        }

        function m() {
            a.updateShows(t.getAllCachedShows())
        }

        function h(e, t) {
            let n = i.get(e);
            n && (n.textContent = t)
        }
        async function g() {
            let e = t.nextViewVersion();
            t.setState({
                view: `libraries`
            }), i.clear(), p(), E(), t.showDashboardLoading();
            try {
                let n = await nt();
                if (!t.isCurrentView(e)) return;
                for (let e of n) {
                    let t = s(`span`, {
                        className: `ts-episode-runtime`
                    }, `正在加载条目…`);
                    i.set(e.Id, t);
                    let n = Dt({
                        title: e.Name,
                        subtitle: `正在加载条目…`,
                        onClick: () => {
                            _(e.Id, e.Name).catch(console.error)
                        }
                    });
                    n.subtitleEl && n.subtitleEl.replaceWith(t), r.append(n.container)
                }
                Promise.all(n.map(e => t.ensureLibraryShows(e.Id, e.Name, t => {
                    h(e.Id, t), m()
                }, () => h(e.Id, `不可用`)).catch(() => []))).catch(console.error)
            } catch (n) {
                if (!t.isCurrentView(e)) return;
                r.append(u(`加载媒体库失败：` + (n instanceof Error ? n.message : `未知错误`), `var(--is-error)`))
            } finally {
                t.hideDashboardLoading()
            }
        }
        async function _(e, n) {
            let i = t.nextViewVersion();
            t.setState({
                view: `shows`,
                libraryId: e,
                libraryName: n
            }), p(), E();
            let a = t.getCachedShows(e);
            if (!a) {
                r.append(u(`正在加载剧集…`)), t.showDashboardLoading();
                try {
                    if (a = await t.ensureLibraryShows(e, n, t => h(e, t), () => h(e, `不可用`)), m(), !t.isCurrentView(i)) return;
                    r.replaceChildren()
                } catch (e) {
                    if (!t.isCurrentView(i)) return;
                    r.replaceChildren(), r.append(u(`加载剧集失败：` + (e instanceof Error ? e.message : `未知错误`), `var(--is-error)`));
                    return
                } finally {
                    t.hideDashboardLoading()
                }
            }
            if (t.isCurrentView(i)) {
                if (!a || a.length === 0) {
                    r.append(u(`该媒体库中没有剧集。`));
                    return
                }
                for (let e of a) {
                    let t = e.ProductionYear ? ` (` + e.ProductionYear + `)` : ``,
                        n = Dt({
                            title: e.Name + t,
                            subtitle: e.Type === `Movie` ? `电影` : `剧集`,
                            onClick: () => {
                                v(e).catch(console.error)
                            }
                        });
                    r.append(n.container)
                }
            }
        }
        async function v(e) {
            let i = t.nextViewVersion();
            if (p(), e.Type === `Movie`) {
                t.setState({
                    view: `episodes`,
                    show: e,
                    seasonId: e.Id,
                    seasonName: ``
                }), E();
                let {
                    container: n
                } = pt({
                    managePanelId: c.container.id,
                    onManageToggle: e => c.toggle(e)
                });
                r.append(n, l), await x(e);
                return
            }
            t.showDashboardLoading();
            try {
                let a = await it(e.Id);
                if (!t.isCurrentView(i)) return;
                if (a.length === 0) {
                    r.append(u(`未找到季。`));
                    return
                }
                let o = a[0];
                t.setState({
                    view: `episodes`,
                    show: e,
                    seasonId: o.Id,
                    seasonName: o.Name
                }), E(), n = gt({
                    seasons: a,
                    activeSeasonId: o.Id,
                    panelId: l.id,
                    managePanelId: c.container.id,
                    onSeasonSelect: t => {
                        y(e, t).catch(console.error)
                    },
                    onManageToggle: e => c.toggle(e)
                }), d(n.getTabId(o.Id)), r.append(n.container, l), await b(e, o)
            } catch (e) {
                if (!t.isCurrentView(i)) return;
                r.append(u(`加载季失败：` + (e instanceof Error ? e.message : `未知错误`), `var(--is-error)`))
            } finally {
                t.hideDashboardLoading()
            }
        }
        async function y(e, r) {
            t.isAlive() && (t.setState({
                view: `episodes`,
                show: e,
                seasonId: r.Id,
                seasonName: r.Name
            }), d(n?.getTabId(r.Id) ?? null), E(), await b(e, r))
        }
        async function b(e, n) {
            let r = t.nextPanelVersion();
            f(!0), o.clear(), o.setStatus(`正在加载剧集列表…`), c.toggle(!1), t.showDashboardLoading();
            try {
                let {
                    episodes: i,
                    segments: a,
                    disabledItemIds: s
                } = await at(e.Id, n.Id);
                if (!t.isCurrentPanel(r)) return;
                if (i.length === 0) {
                    o.setStatus(`未找到剧集。`);
                    return
                }
                o.render(i, a, !1, S(s)), C(s, `加载片段设置失败；启用/禁用开关已隐藏。`), await c.loadForSeason(e.Id, n.Id, !1)
            } catch (e) {
                if (!t.isCurrentPanel(r)) return;
                o.setStatus(`加载剧集失败：` + (e instanceof Error ? e.message : `未知错误`), `var(--is-error)`)
            } finally {
                t.isCurrentPanel(r) && f(!1), t.hideDashboardLoading()
            }
        }
        async function x(e) {
            let n = t.nextPanelVersion();
            f(!0), o.clear(), o.setStatus(`正在加载时间戳…`), c.toggle(!1), t.showDashboardLoading();
            try {
                let r = {
                        Id: e.Id,
                        Name: e.Name,
                        IndexNumber: null,
                        RunTimeTicks: null,
                        SeriesName: null
                    },
                    [i, a] = await Promise.all([ot(e.Id), st(e.Id)]);
                if (!t.isCurrentPanel(n)) return;
                o.render([r], [i], !0, S(a)), C(a, `加载片段设置失败；启用/禁用开关已隐藏。`), await c.loadForSeason(e.Id, e.Id, !0)
            } catch (e) {
                if (!t.isCurrentPanel(n)) return;
                o.setStatus(`加载时间戳失败：` + (e instanceof Error ? e.message : `未知错误`), `var(--is-error)`)
            } finally {
                t.isCurrentPanel(n) && f(!1), t.hideDashboardLoading()
            }
        }

        function S(e) {
            return e === null ? void 0 : {
                ids: e,
                onChange: w
            }
        }

        function C(e, t) {
            e === null && o.setStatus(t, `var(--is-error)`)
        }
        async function w(e, t) {
            if (!(await ct(e, t)).ok) throw Error(`setItemDisabled failed`)
        }
        async function ee() {
            if (o.hasUnsavedEdits()) {
                o.setStatus(`服务器上的结果已变化，编辑器存在未保存的更改。`, `var(--is-warning)`, {
                    label: `刷新`,
                    onClick: () => {
                        T().catch(console.error)
                    }
                });
                return
            }
            await T()
        }
        async function T() {
            let e = t.getState();
            if (!t.isAlive() || e.view !== `episodes`) return;
            let {
                show: n,
                seasonId: r,
                seasonName: i
            } = e;
            if (n.Type === `Movie`) {
                await x(n);
                return
            }
            await b(n, {
                Id: r,
                Name: i,
                IndexNumber: null
            })
        }

        function E() {
            let e = t.getState(),
                n = [];
            if (n.push({
                    label: `所有媒体库`,
                    onClick: e.view === `libraries` ? void 0 : () => {
                        g().catch(console.error)
                    }
                }), e.view === `shows` || e.view === `episodes`) {
                let t = e.view === `shows` ? e.libraryName : e.show.LibraryName,
                    r = e.view === `shows` ? e.libraryId : e.show.LibraryId;
                n.push({
                    label: t,
                    onClick: e.view === `shows` ? void 0 : () => {
                        _(r, t).catch(console.error)
                    }
                })
            }
            if (e.view === `episodes`) {
                let t = e.show,
                    r = t.ProductionYear ? ` (` + t.ProductionYear + `)` : ``;
                n.push({
                    label: t.Name + r,
                    onClick: t.Type === `Movie` ? void 0 : () => {
                        v(t).catch(console.error)
                    }
                }), t.Type !== `Movie` && e.seasonName && n.push({
                    label: e.seasonName
                })
            }
            a.updateSegments(n)
        }
        return {
            destroy() {
                t.destroy(), a.destroy(), o.destroy(), c.destroy(), f(!1)
            }
        }
    }
    var X = null,
        kt = {
            id: `timestamps`,
            label: `Timestamps`,
            render(e) {
                X?.destroy(), X = Ot(e)
            },
            destroy() {
                X?.destroy(), X = null
            }
        };

    function At(e) {
        let t = s(`div`, {
                className: `tab-warning`,
                role: `status`
            }),
            n = s(`span`, {
                className: `tab-warning-icon`
            });
        n.textContent = `⚠`;
        let r = s(`span`);
        return r.textContent = e, t.append(n, r), t
    }
    var jt = {
        id: `tools`,
        label: `Tools`,
        render(e) {
            let t = `global-timestamp-type`,
                n = s(`div`, {
                    className: `select-container`
                }),
                r = s(`label`, {
                    className: `select-label`,
                    for: t
                }, `全局时间戳类型`),
                i = s(`select`, {
                    id: t,
                    name: `global-timestamp-type`
                });
            const gn = {
                introduction: `片头`,
                recap: `回述`,
                credits: `片尾`,
                preview: `预告`,
                commercial: `广告`
            }, apin = {
                introduction: `Introduction`,
                recap: `Recap`,
                credits: `Credits`,
                preview: `Preview`,
                commercial: `Commercial`
            };
            i.append(s(`option`, {
                value: `introduction`
            }, `片头（Introduction）`)), i.append(s(`option`, {
                value: `recap`
            }, `回述（Recap）`)), i.append(s(`option`, {
                value: `credits`
            }, `片尾（Credits）`)), i.append(s(`option`, {
                value: `preview`
            }, `预告（Preview）`)), i.append(s(`option`, {
                value: `commercial`
            }, `广告（Commercial）`)), n.append(r, i);
            let a = s(`button`, {
                className: `action-button raised block`,
                type: `button`
            }, `擦除全部片头时间戳`);
            i.addEventListener(`change`, () => {
                a.textContent = `擦除全部 ` + gn[i.value] + ` 时间戳`
            }), a.addEventListener(`click`, async () => {
                let e = apin[i.value];
                if (!e) return;
                let t = await U({
                    title: `确认擦除时间戳`,
                    body: `确定要擦除之前检测到的全部 ` + gn[i.value] + ` 时间戳吗？`,
                    confirmLabel: `擦除`,
                    checkbox: {
                        label: `包含缓存的指纹文件`
                    }
                });
                if (t) try {
                    if (!(await D(e, t.checkboxChecked)).ok) {
                        window.Dashboard.alert(`擦除 ` + gn[i.value] + ` 时间戳失败`);
                        return
                    }
                    window.Dashboard.alert(gn[i.value] + ` 时间戳已擦除`)
                } catch {
                    window.Dashboard.alert(`擦除 ` + gn[i.value] + ` 时间戳失败`)
                }
            });
            let o = s(`button`, {
                className: `action-button raised block`,
                type: `button`
            }, `重建本地数据库`);
            o.addEventListener(`click`, async () => {
                if (await U({
                        title: `确认重建数据库`,
                        body: `确定要重建数据库吗？此操作需要完整重启 Jellyfin 才能完成。`,
                        confirmLabel: `重建`
                    })) try {
                    let e = await ce();
                    if (e.status === 409) {
                        if (!await U({
                                title: `数据库不可读`,
                                body: `无法读取现有数据库进行备份。重建将丢弃所有已存时间戳并以空库开始。继续吗？`,
                                confirmLabel: `放弃并重建`
                            })) return;
                        e = await ce({
                            forceCleanOnBackupFailure: !0
                        })
                    }
                    if (!e.ok) {
                        window.Dashboard.alert(`重建数据库失败`);
                        return
                    }
                    window.Dashboard.alert(`已开始重建数据库，需要完整重启 Jellyfin。`)
                } catch {
                    window.Dashboard.alert(`重建数据库失败`)
                }
            }), L(e, n, a, o, At(`重建数据库需要完整重启 Jellyfin 才能完成，仅重启控制台（Dashboard）是不够的。`))
        }
    };
    async function Mt(e) {
        try {
            if (navigator.clipboard) return await navigator.clipboard.writeText(e), !0
        } catch {}
        let t = s(`textarea`, {
            readonly: ``,
            "aria-hidden": `true`
        });
        t.value = e, t.style.position = `fixed`, t.style.opacity = `0`, document.body.append(t), t.select();
        let n = !1;
        try {
            n = document.execCommand(`copy`)
        } catch {
            n = !1
        }
        return t.remove(), n
    }

    function Nt(e) {
        let t = s(`dl`, {
            className: `support-grid`
        });
        for (let n of e) t.append(s(`dt`, {}, n.Label), s(`dd`, {}, n.Value));
        return t
    }

    function Pt(e) {
        if (typeof e.Text == `string`) return s(`pre`, {
            className: `support-pre`
        }, e.Text);
        let t = e.Entries ?? [];
        return t.length > 0 ? Nt(t) : s(`div`, {
            className: `support-none`
        }, `None`)
    }

    function Ft(e) {
        if (typeof e.Text == `string`) {
            let t = e.Text.length === 0 ? 0 : e.Text.trimEnd().split(`
`).length;
            return t === 1 ? `1 行` : `${t} 行`
        }
        let t = e.Entries?.length ?? 0;
        return t === 1 ? `1 个条目` : `${t} 个条目`
    }

    function It(e) {
        let t = [],
            n = !1;
        for (let r of e) {
            if (!r.Collapsed) {
                let e = s(`div`, {
                    className: `support-section`
                });
                e.append(s(`div`, {
                    className: `support-title`
                }, r.Title), Pt(r)), t.push(e);
                continue
            }
            n || (n = !0, t.push(s(`div`, {
                className: `support-title`
            }, `详细信息`)));
            let e = s(`details`, {
                    className: `support-fold`
                }),
                i = s(`summary`, {}, r.Title);
            i.append(s(`span`, {
                className: `support-fold-meta`
            }, Ft(r))), e.append(i, Pt(r)), t.push(e)
        }
        return t
    }
    var Lt = [Be, Ve, Ue, We, Je, Xe, kt, jt, {
            id: `information`,
            label: `信息`,
            render(e) {
                let t = s(`section`, {
                        className: `tab-readonly-section`
                    }),
                    n = s(`h3`, {
                        className: `checkbox-list-label`,
                        id: `support-log-label`
                    }, `Intro Skipper 支持日志`),
                    r = s(`button`, {
                        className: `raised button-submit`,
                        type: `button`
                    }, `复制到剪贴板`);
                r.disabled = !0;
                let i = s(`div`, {
                    className: `support-head`
                });
                i.append(n, r);
                let a = s(`div`, {
                        className: `status-message`,
                        id: `support-log-status`
                    }),
                    o = l(a, {
                        display: `block`
                    });
                r.setAttribute(`aria-describedby`, a.id);
                let c = s(`div`, {});
                c.setAttribute(`aria-labelledby`, n.id), L(t, i, a, c);
                let u = ``,
                    d;
                r.addEventListener(`click`, async () => {
                    if (u) {
                        if (await Mt(u)) {
                            d?.remove(), d = void 0, window.Dashboard.alert(`支持包已复制到剪贴板`);
                            return
                        }
                        d || (d = s(`textarea`, {
                            readonly: ``,
                            rows: `12`
                        }), d.setAttribute(`aria-labelledby`, n.id), i.after(d)), d.value = u, d.focus(), d.setSelectionRange(0, u.length), window.Dashboard.alert(`按 Ctrl+C 复制支持包`)
                    }
                });
                async function f() {
                    o.show(`正在加载支持日志…`);
                    try {
                        let e = await oe();
                        u = e.Markdown, c.replaceChildren(...It(e.Sections)), r.disabled = !u, e.Sections.length === 0 ? o.show(`支持日志为空。`) : o.clear()
                    } catch {
                        u = ``, c.replaceChildren(), r.disabled = !0, o.show(`加载支持日志失败。`, `var(--is-error)`)
                    }
                }
                f().catch(console.error);
                let p = s(`section`, {
                        className: `tab-readonly-section`
                    }),
                    m = s(`h3`, {
                        className: `checkbox-list-label`
                    }, `存储占用`);
                m.id = `storage-usage-label`;
                let h = s(`div`, {
                        className: `field-description`
                    }, `查看每个媒体库占用多少空间。`),
                    g = s(`div`, {
                        className: `status-message`,
                        id: `storage-usage-status`
                    }),
                    _ = l(g, {
                        display: `block`
                    });
                _.show(`正在加载存储占用…`);
                let v = s(`div`, {});
                v.setAttribute(`aria-labelledby`, m.id), L(p, m, h, g, v);

                function y(e) {
                    if (e <= 0) return `0 B`;
                    let t = [`B`, `KB`, `MB`, `GB`, `TB`],
                        n = Math.floor(Math.log(e) / Math.log(1024));
                    return (e / 1024 ** n).toFixed(1) + ` ` + t[n]
                }

                function b(e) {
                    return e >= 90 ? `var(--is-error)` : e >= 75 ? `var(--is-warning)` : `var(--is-success)`
                }

                function x(e, t, n, r) {
                    let i = n + r,
                        a = i > 0 ? n / i * 100 : 0,
                        o = s(`li`, {
                            className: `storage-item`
                        }),
                        c = s(`div`, {
                            className: `storage-item-body`
                        });
                    c.append(s(`div`, {
                        className: `storage-item-name`
                    }, e)), c.append(s(`div`, {
                        className: `storage-item-path`
                    }, t));
                    let l = s(`div`, {
                            className: `storage-bar-track`
                        }),
                        u = s(`div`, {
                            className: `storage-bar-fill`,
                            style: `width:${a.toFixed(1)}%;background:${b(a)};`
                        });
                    return l.append(u), c.append(l), c.append(s(`div`, {
                        className: `storage-item-usage`
                    }, `${y(n)} / ${y(i)}`)), o.append(c), o
                }
                async function S() {
                    _.show(`正在加载存储占用…`);
                    try {
                        let e = await se();
                        if (v.replaceChildren(), e.length === 0) {
                            _.show(`存储占用为空。`);
                            return
                        }
                        let t = s(`ul`, {
                            className: `storage-list`
                        });
                        for (let n of e)
                            for (let e of n.Folders) t.append(x(n.Name, e.Path, e.UsedSpace, e.FreeSpace));
                        v.append(t), _.show(`存储占用已加载。`)
                    } catch {
                        v.replaceChildren(), _.show(`加载存储占用失败。`, `var(--is-error)`)
                    }
                }
                S().catch(console.error), L(e, t, p)
            }
        }],
        Rt = `#intro-skipper-dashboard-root`,
        zt = `general`,
        Z = null,
        Q = 0,
        $ = null;

    function Bt() {
        Q += 1, Z?.(), Z = null
    }

    function Vt(e) {
        let t = e.closest(`.page`);
        return t || console.warn(`[intro-skipper] No .page ancestor found; pageshow/pagehide lifecycle events will not fire.`), t ?? e
    }

    function Ht(e) {
        Bt(), e.replaceChildren();
        let t = Q,
            {
                navEl: n,
                contentEl: r,
                destroy: i
            } = me(e),
            a = new he(n, r);
        Z = () => {
            a.destroy(), i()
        };
        for (let e of Lt) a.register(e);
        F.load().then(() => {
            t === Q && a.switchTo(zt)
        }).catch(() => {})
    }

    function Ut(e) {
        if (e.dataset.introSkipperBound === `true`) return;
        e.dataset.introSkipperBound = `true`, $ = e;
        let t = Vt(e);
        t.addEventListener(`pageshow`, () => {
            Ht(e)
        }), t.addEventListener(`pagehide`, () => {
            Bt()
        }), Ht(e)
    }

    function Wt() {
        let e = document.querySelector(Rt);
        return e ? (Ut(e), !0) : !1
    }
    Wt();
    var Gt = new MutationObserver(() => {
            if ($) {
                if ($.isConnected) return;
                $ = null
            }
            Wt()
        }),
        Kt = document.body ?? document.documentElement;
    Gt.observe(Kt, {
        childList: !0,
        subtree: !0
    })
})();