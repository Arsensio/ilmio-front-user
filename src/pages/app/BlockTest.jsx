import { useState, useEffect, useMemo } from "react";
import { COLORS } from "../../theme/colors";
import muizzaLike from "../../assets/images/muizza_think.png";

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

    /* ================= RESET ON QUESTION ================= */

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
        if (!lastResult || question.type !== "MATCH_PROGRESSIVE") return;

        if (lastResult.ok) {
            setResolvedPairs(p => ({ ...p, ...lastResult.pair }));
        } else {
            setWrongPair(lastResult.pair);
            setTimeout(() => setWrongPair(null), 600);
        }

        setSelectedKey(null);
        setSelectedValue(null);
    }, [lastResult, question.type]);

    useEffect(() => {
        if (
            question.type === "MATCH_PROGRESSIVE" &&
            Object.keys(resolvedPairs).length === question.items.length
        ) {
            onChange({
                type: "FINISH_PROGRESSIVE",
                payload: resolvedPairs,
            });
        }
    }, [resolvedPairs]);

    /* ================= RENDERS ================= */

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
                            className={`
                            w-full
                            min-h-[64px]
                            flex items-center gap-4
                            px-4 py-3
                            rounded-full
                            border-2
                            text-left
                            transition-all
                            ${
                                active
                                    ? "border-blue-500 bg-blue-50"
                                    : "border-black/20 bg-white"
                            }
                        `}
                        >
                            {/* KEY (A / B / C / D) */}
                            <div
                                className={`
                                w-[36px] h-[36px]
                                rounded-full
                                flex items-center justify-center
                                font-black
                                shrink-0
                                ${
                                    active
                                        ? "bg-blue-500 text-white"
                                        : "bg-blue-100 text-black"
                                }
                            `}
                            >
                                {it.key}
                            </div>

                            {/* VALUE */}
                            <div className="font-bold text-[15px] leading-snug">
                                {it.value}
                            </div>
                        </button>
                    );
                })}

                {lastResult !== null && (
                    <div className="text-center font-black mt-3">
                        {lastResult ? "✅ Правильно!" : "❌ Неправильно"}
                    </div>
                )}
            </div>
        );
    }

    function renderTrueFalse() {
        return (
            <div className="mt-5 grid grid-cols-2 gap-3">
                {question.items.map(it => (
                    <button
                        key={it.key}
                        onClick={() => setSelectedKey(it.key)}
                        disabled={answerLocked}
                        className={`h-[60px] rounded-[24px] font-black
                            ${selectedKey === it.key ? "bg-blue-200" : "bg-white"}
                        `}
                    >
                        {it.value}
                    </button>
                ))}

                {lastResult !== null && (
                    <div className="col-span-2 text-center font-black mt-3">
                        {lastResult ? "✅ Правильно!" : "❌ Неправильно"}
                    </div>
                )}
            </div>
        );
    }

    function renderMatch() {
        const usedValues = Object.values(matchPairs);

        return (
            <div className="mt-5 space-y-4">
                {question.items.map(it => {
                    const currentValue = matchPairs[it.key] || "";

                    return (
                        <div key={it.key} className="flex gap-3 items-center">
                            {/* LEFT */}
                            <div className="w-1/2 h-[56px] bg-blue-100 rounded-[18px] flex items-center justify-center font-black">
                                {it.key}
                            </div>

                            {/* RIGHT */}
                            <select
                                className={`w-1/2 h-[56px] rounded-[18px] px-3 font-bold
                                    ${!currentValue
                                    ? "border-2 border-dashed border-blue-400"
                                    : "border"}
                                `}
                                value={currentValue}
                                disabled={answerLocked}
                                onChange={e =>
                                    setMatchPairs(p => ({
                                        ...p,
                                        [it.key]: e.target.value,
                                    }))
                                }
                            >
                                <option value="">Выберите значение</option>

                                {question.items
                                    .map(o => o.value)
                                    .filter(v =>
                                        v === currentValue || !usedValues.includes(v)
                                    )
                                    .map(v => (
                                        <option key={v} value={v}>
                                            {v}
                                        </option>
                                    ))}
                            </select>
                        </div>
                    );
                })}

                {lastResult !== null && (
                    <div className="text-center font-black mt-3">
                        {lastResult ? "✅ Правильно!" : "❌ Неправильно"}
                    </div>
                )}
            </div>
        );
    }

    function renderMatchProgressive() {
        const usedValues = Object.values(resolvedPairs);

        const keys = question.items.map(i => i.key).filter(k => !resolvedPairs[k]);
        const values = question.items.map(i => i.value).filter(v => !usedValues.includes(v));

        return (
            <div className="mt-5 flex gap-6">
                <div className="flex-1 space-y-3">
                    {keys.map(k => (
                        <button
                            key={k}
                            onClick={() => setSelectedKey(k)}
                            className={`w-full h-[56px] rounded-[18px] font-black
                                ${wrongPair?.key === k
                                ? "border-2 border-red-500"
                                : "bg-blue-100"}
                            `}
                        >
                            {k}
                        </button>
                    ))}
                </div>

                <div className="flex-1 space-y-3">
                    {values.map(v => (
                        <button
                            key={v}
                            onClick={() => setSelectedValue(v)}
                            className={`w-full h-[56px] rounded-[18px] font-bold
                                ${wrongPair?.value === v
                                ? "border-2 border-red-500"
                                : "bg-green-100"}
                            `}
                        >
                            {v}
                        </button>
                    ))}
                </div>
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
