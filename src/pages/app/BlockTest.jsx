import { useState, useEffect, useMemo } from "react";
import { COLORS } from "../../theme/colors";
import muizzaLike from "../../assets/images/muizza_think.png";
import { useTranslation } from "react-i18next";
import {t} from "i18next";

export default function BlockTest({
                                      question,
                                      answerLocked,
                                      lastResult,
                                      onChange,
                                  }) {
    /* ================= COMMON ================= */

    const [selectedKey, setSelectedKey] = useState(null);

    /* ================= MATCH ================= */

    const [matchPairs, setMatchPairs] = useState({});

    /* ================= MATCH_PROGRESSIVE ================= */

    const [selectedValue, setSelectedValue] = useState(null);
    const [resolvedPairs, setResolvedPairs] = useState({});
    const [wrongPair, setWrongPair] = useState(null);
    const [correctPair, setCorrectPair] = useState(null);
    const [allDone, setAllDone] = useState(false);
    /* ================= RESET ON QUESTION ================= */

    useEffect(() => {
        if (!lastResult || question.type !== "MATCH_PROGRESSIVE") return;

        const pair = lastResult.pair;

        if (lastResult.ok) {
            // подсветить выбранную пару ЗЕЛЁНЫМ
            setCorrectPair(pair);

            setTimeout(() => {
                setResolvedPairs(p => ({ ...p, ...pair }));
                setCorrectPair(null);
            }, 600);
        } else {
            // подсветить выбранную пару КРАСНЫМ
            setWrongPair(pair);
            setTimeout(() => setWrongPair(null), 600);
        }

        // сброс выбора после показа результата
        setTimeout(() => {
            setSelectedKey(null);
            setSelectedValue(null);
        }, 600);
    }, [lastResult, question.type]);



    useEffect(() => {
        setSelectedKey(null);
        setSelectedValue(null);
        setMatchPairs({});
        setResolvedPairs({});
        setWrongPair(null);
    }, [question.id]);

    /* ================= OLD FLOW ================= */

    useEffect(() => {
        if (question.type === "MATCH_PROGRESSIVE") return;

        if (question.type === "MATCH") {
            onChange({
                ready: Object.keys(matchPairs).length === question.items.length,
                payload: matchPairs,
            });
            return;
        }

        if (selectedKey) {
            const item = question.items.find(i => i.key === selectedKey);
            if (item) {
                onChange({
                    ready: true,
                    payload: { [item.key]: item.value },
                });
            }
        } else {
            onChange({ ready: false, payload: null });
        }
    }, [selectedKey, matchPairs, question, onChange]);

    /* ================= MATCH_PROGRESSIVE ================= */

    useEffect(() => {
        if (
            question.type !== "MATCH_PROGRESSIVE" ||
            !selectedKey ||
            !selectedValue
        ) return;

        onChange({
            type: "CHECK_PAIR",
            payload: { [selectedKey]: selectedValue },
        });
    }, [selectedKey, selectedValue]);


    useEffect(() => {
        if (
            question.type !== "MATCH_PROGRESSIVE" ||
            Object.keys(resolvedPairs).length !== question.items.length
        ) return;

        setAllDone(true);

        // даём пользователю увидеть "Всё правильно"
        setTimeout(() => {
            onChange({
                type: "FINISH_PROGRESSIVE",
                payload: resolvedPairs,
            });
        }, 700);
    }, [resolvedPairs, question]);


    /* ================= RENDERS ================= */

    function getPairStyle({ selected, correct, wrong, baseBg }) {
        if (correct) {
            return {
                backgroundColor: COLORS.brand.successBg,
                border: `3px solid ${COLORS.brand.successBorder}`,
            };
        }

        if (wrong) {
            return {
                backgroundColor: COLORS.brand.errorBg,
                border: `3px solid ${COLORS.brand.errorBorder}`,
            };
        }

        if (selected) {
            return {
                backgroundColor: COLORS.brand.selectBlueBg,
                border: `2px solid ${COLORS.brand.selectBlueBorder}`,
            };
        }

        return {
            backgroundColor: baseBg,
            border: "2px solid transparent",
        };
    }


    function renderSingleChoice() {
        return (
            <div className="mt-5 space-y-3">
                {question.items.map((it) => {
                    const active = selectedKey === it.key;

                    return (
                        <button
                            key={it.key}
                            onClick={() => setSelectedKey(it.key)}
                            disabled={answerLocked}
                            className="
                            w-full
                            min-h-[64px]
                            flex items-center gap-4
                            px-4 py-3
                            rounded-full
                            text-left
                            transition-all
                        "
                            style={{
                                backgroundColor: active
                                    ? COLORS.brand.selectBlueBg
                                    : COLORS.white,
                                border: active
                                    ? `2px solid ${COLORS.brand.selectBlueBorder}`
                                    : "2px solid transparent",
                            }}
                        >
                            {/* KEY (A / B / C / D) */}
                            <div
                                className="
                                w-[36px] h-[36px]
                                rounded-full
                                flex items-center justify-center
                                font-black
                                shrink-0
                            "
                                style={{
                                    backgroundColor: active
                                        ? COLORS.brand.selectBlueBorder
                                        : COLORS.brand.neutralBlueBg,
                                    color: active
                                        ? COLORS.white
                                        : COLORS.black,
                                }}
                            >
                                {it.key}
                            </div>

                            {/* VALUE */}
                            <div
                                className="font-bold text-[15px] leading-snug"
                                style={{ color: COLORS.text.dark }}
                            >
                                {it.value}
                            </div>
                        </button>
                    );
                })}

                {lastResult !== null && (
                    <div
                        className="text-center font-black mt-3"
                        style={{
                            color: lastResult
                                ? COLORS.brand.successBorder
                                : COLORS.brand.errorBorder,
                        }}
                    >
                        {lastResult
                            ? t("lesson.test.correct")
                            : t("lesson.test.wrong")}
                    </div>
                )}
            </div>
        );
    }


    function renderTrueFalse() {
        return (
            <div className="mt-5 grid grid-cols-2 gap-3">
                {question.items.map((it) => {
                    const active = selectedKey === it.key;

                    return (
                        <button
                            key={it.key}
                            onClick={() => setSelectedKey(it.key)}
                            disabled={answerLocked}
                            className="
                            h-[64px]
                            rounded-full
                            flex items-center justify-center
                            font-black
                            transition-all
                        "
                            style={{
                                backgroundColor: active
                                    ? COLORS.brand.selectBlueBg
                                    : COLORS.white,
                                border: active
                                    ? `2px solid ${COLORS.brand.selectBlueBorder}`
                                    : "2px solid transparent",
                                color: COLORS.text.dark,
                            }}
                        >
                            {it.value}
                        </button>
                    );
                })}

                {lastResult !== null && (
                    <div
                        className="col-span-2 text-center font-black mt-3"
                        style={{
                            color: lastResult
                                ? COLORS.brand.successBorder
                                : COLORS.brand.errorBorder,
                        }}
                    >
                        {lastResult
                            ? t("lesson.test.correct")
                            : t("lesson.test.wrong")}
                    </div>
                )}
            </div>
        );
    }


    function renderMatch() {
        const usedValues = Object.values(matchPairs);

        return (
            <div className="mt-5 space-y-4">
                {question.items.map((it) => {
                    const currentValue = matchPairs[it.key] || "";
                    const isEmpty = !currentValue;

                    return (
                        <div
                            key={it.key}
                            className="flex gap-3 items-center"
                        >
                            {/* LEFT — KEY */}
                            <div
                                className="w-1/2 h-[56px] rounded-[18px] flex items-center justify-center font-black"
                                style={{
                                    backgroundColor: COLORS.brand.neutralBlueBg,
                                    color: COLORS.text.dark,
                                }}
                            >
                                {it.key}
                            </div>

                            {/* RIGHT — SELECT */}
                            <select
                                value={currentValue}
                                disabled={answerLocked}
                                onChange={(e) =>
                                    setMatchPairs((p) => ({
                                        ...p,
                                        [it.key]: e.target.value,
                                    }))
                                }
                                className="
                                w-1/2 h-[56px]
                                rounded-[18px]
                                px-3
                                font-bold
                                transition-all
                            "
                                style={{
                                    backgroundColor: COLORS.white,
                                    border: isEmpty
                                        ? `2px dashed ${COLORS.brand.selectBlueBorder}`
                                        : `2px solid ${COLORS.brand.selectBlueBorder}`,
                                    color: COLORS.text.dark,
                                }}
                            >
                                <option value="">
                                    {t("lesson.test.selectValue")}
                                </option>

                                {question.items
                                    .map((o) => o.value)
                                    .filter(
                                        (v) =>
                                            v === currentValue ||
                                            !usedValues.includes(v)
                                    )
                                    .map((v) => (
                                        <option key={v} value={v}>
                                            {v}
                                        </option>
                                    ))}
                            </select>
                        </div>
                    );
                })}

                {lastResult !== null && (
                    <div
                        className="text-center font-black mt-3"
                        style={{
                            color: lastResult
                                ? COLORS.brand.successBorder
                                : COLORS.brand.errorBorder,
                        }}
                    >
                        {lastResult
                            ? t("lesson.test.correct")
                            : t("lesson.test.wrong")}
                    </div>
                )}
            </div>
        );
    }

    function renderMatchProgressive() {
        const usedValues = Object.values(resolvedPairs);

        const keys = question.items
            .map(i => i.key)
            .filter(k => !resolvedPairs[k]);

        const values = question.items
            .map(i => i.value)
            .filter(v => !usedValues.includes(v));

        return (
            <div className="mt-5">
                <div className="flex gap-6">
                    {/* KEYS */}
                    <div className="flex-1 space-y-3">
                        {keys.map(k => {
                            const style = getPairStyle({
                                selected: selectedKey === k,
                                correct: correctPair?.key === k,
                                wrong: wrongPair?.key === k,
                                baseBg: "#E6F0FF",
                            });

                            return (
                                <button
                                    key={k}
                                    onClick={() => setSelectedKey(k)}
                                    disabled={answerLocked || allDone}
                                    className="w-full h-[56px] rounded-[18px] font-black transition-all"
                                    style={style}
                                >
                                    {k}
                                </button>
                            );
                        })}
                    </div>

                    {/* VALUES */}
                    <div className="flex-1 space-y-3">
                        {values.map(v => {
                            const style = getPairStyle({
                                selected: selectedValue === v,
                                correct: correctPair?.value === v,
                                wrong: wrongPair?.value === v,
                                baseBg: "#E8F7E6",
                            });

                            return (
                                <button
                                    key={v}
                                    onClick={() => setSelectedValue(v)}
                                    disabled={answerLocked || allDone}
                                    className="w-full h-[56px] rounded-[18px] font-bold transition-all"
                                    style={style}
                                >
                                    {v}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* ✅ ВСЁ ПРАВИЛЬНО */}
                {allDone && (
                    <div
                        className="mt-4 text-center font-black text-[18px]"
                        style={{ color: COLORS.brand.successBorder }}
                    >
                        {t("lesson.test.allCorrect")}
                    </div>
                )}
            </div>
        );
    }

    /* ================= UI ================= */

    return (
        <div className="relative">
            <div className="flex justify-center mb-[-8px]">
                <img src={muizzaLike} className="w-[180px]" />
            </div>

            <div className="bg-white rounded-[34px] px-6 py-6 shadow-xl">
                <div
                    className="text-[22px] font-black mb-4"
                    style={{ color: COLORS.brand.titleBlue }}
                >
                    {question.text}
                </div>

                {question.type === "SINGLE_CHOICE" && renderSingleChoice()}
                {question.type === "TRUE_FALSE" && renderTrueFalse()}
                {question.type === "MATCH" && renderMatch()}
                {question.type === "MATCH_PROGRESSIVE" && renderMatchProgressive()}
            </div>
        </div>
    );
}
