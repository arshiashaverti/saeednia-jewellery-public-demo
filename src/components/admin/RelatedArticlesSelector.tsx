import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  BookOpen,
  CheckCircle2,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import type { Article } from '../../types';
import { toPersianDigits } from '../../utils/contactAndArticles';

interface RelatedArticlesSelectorProps {
  currentArticleId?: string;
  selectedIds: string[];
  onChange: (nextIds: string[]) => void;
  articles: Article[];
}

export const RelatedArticlesSelector: React.FC<RelatedArticlesSelectorProps> = ({
  currentArticleId,
  selectedIds,
  onChange,
  articles,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const availableArticles = (articles || []).filter(
    (a) =>
      !a.isDeleted &&
      a.published === true &&
      a.id !== currentArticleId &&
      !selectedIds.includes(a.id)
  );

  const filteredCandidates = availableArticles.filter((a) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      a.titleFa.toLowerCase().includes(q) ||
      (a.titleEn || '').toLowerCase().includes(q) ||
      (a.slug || '').toLowerCase().includes(q)
    );
  });

  const selectedArticles = selectedIds
    .map((id) => (articles || []).find((a) => a.id === id && !a.isDeleted))
    .filter(Boolean) as Article[];

  const handleAdd = (id: string) => {
    if (selectedIds.length >= 3) return;
    if (id === currentArticleId) return;
    if (selectedIds.includes(id)) return;
    onChange([...selectedIds, id]);
  };

  const handleRemove = (id: string) => {
    onChange(selectedIds.filter((item) => item !== id));
  };

  const moveItem = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= selectedIds.length) return;
    const copy = [...selectedIds];
    [copy[idx], copy[target]] = [copy[target], copy[idx]];
    onChange(copy);
  };

  const count = selectedIds.length;
  const isValidSelection = count === 0 || count === 2 || count === 3;

  return (
    <div className="p-4 bg-[#111116] border border-[#C5A059]/20 rounded-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#C5A059]/15 pb-3">
        <div>
          <h4 className="text-xs font-persian-nav font-semibold text-[#D4AF37] flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            <span>مطالب پیشنهادی برای مطالعه ({toPersianDigits(count)} از ۳)</span>
          </h4>
          <p className="text-[11px] text-[#8C8880] mt-0.5">
            بین ۲ تا ۳ مقاله منتشرشده را برای نمایش در پایان این مقاله انتخاب کنید (مقاله جاری و پیش‌نویس‌ها مجاز نیستند).
          </p>
        </div>

        {count > 0 && (
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-sm text-[11px] border shrink-0 ${
              isValidSelection
                ? 'bg-emerald-950/50 text-emerald-300 border-emerald-500/30'
                : 'bg-amber-950/60 text-amber-300 border-amber-500/40'
            }`}
          >
            {isValidSelection ? (
              <CheckCircle2 className="w-3.5 h-3.5" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5" />
            )}
            <span>
              {isValidSelection
                ? `${toPersianDigits(count)} مقاله پیشنهادی معتبر`
                : 'حداقل ۲ مقاله انتخاب کنید یا خالی بگذارید'}
            </span>
          </span>
        )}
      </div>

      {/* Selected Articles List */}
      {selectedArticles.length > 0 && (
        <div className="space-y-2">
          <span className="text-[11px] text-[#C8C4BC] block">مقالات انتخاب‌شده (به ترتیب نمایش):</span>
          {selectedArticles.map((art, idx) => (
            <div
              key={art.id}
              className="p-2.5 bg-[#08080C] border border-[#C5A059]/25 rounded-sm flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-[10px] font-mono text-stone-500">#{idx + 1}</span>
                {art.coverImage ? (
                  <img
                    src={art.coverImage}
                    alt={art.titleFa}
                    className="w-10 h-10 rounded-sm object-cover border border-[#C5A059]/20 shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-sm bg-[#14141A] border border-[#C5A059]/15 flex items-center justify-center shrink-0">
                    <BookOpen className="w-4 h-4 text-[#C5A059]/50" />
                  </div>
                )}
                <div className="min-w-0">
                  <div className="text-xs text-[#EDE8DF] truncate">{art.titleFa}</div>
                  <div className="text-[10px] font-mono text-[#8C8880] truncate" dir="ltr">
                    /blog/{art.slug}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => moveItem(idx, -1)}
                  className="p-1 text-stone-400 hover:text-[#C5A059] disabled:opacity-30"
                  title="انتقال به بالا"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  disabled={idx === selectedArticles.length - 1}
                  onClick={() => moveItem(idx, 1)}
                  className="p-1 text-stone-400 hover:text-[#C5A059] disabled:opacity-30"
                  title="انتقال به پایین"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleRemove(art.id)}
                  className="p-1 text-stone-400 hover:text-rose-400"
                  title="حذف از فهرست پیشنهادی"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Search & Candidate List */}
      {selectedIds.length < 3 && (
        <div className="space-y-2 pt-1">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#8C8880] absolute start-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجو بین مقالات منتشرشده..."
              className="w-full ps-8 pe-3 py-1.5 bg-[#060608] border border-[#C5A059]/20 rounded-sm text-xs text-[#EDE8DF]"
            />
          </div>

          {filteredCandidates.length > 0 ? (
            <div className="max-h-44 overflow-y-auto space-y-1.5 pr-1">
              {filteredCandidates.map((cand) => (
                <div
                  key={cand.id}
                  className="p-2 bg-[#08080C] border border-[#C5A059]/15 hover:border-[#C5A059]/40 rounded-sm flex items-center justify-between gap-2 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {cand.coverImage && (
                      <img
                        src={cand.coverImage}
                        alt={cand.titleFa}
                        className="w-8 h-8 rounded-sm object-cover shrink-0 border border-[#C5A059]/15"
                      />
                    )}
                    <div className="min-w-0">
                      <div className="text-[11px] text-[#EDE8DF] truncate">{cand.titleFa}</div>
                      <div className="text-[10px] font-mono text-[#8C8880]">
                        {new Date(cand.createdAt).toLocaleDateString('fa-IR')}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAdd(cand.id)}
                    className="px-2.5 py-1 bg-[#181822] hover:bg-[#C5A059] text-[#C5A059] hover:text-black border border-[#C5A059]/30 rounded-sm text-[11px] flex items-center gap-1 shrink-0 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    <span>افزودن</span>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-[#8C8880] italic p-2">
              مقاله منتشرشده دیگری برای انتخاب یافت نشد.
            </p>
          )}
        </div>
      )}
    </div>
  );
};
