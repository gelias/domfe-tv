const DOCTRINAL_DAYS = new Set([2, 4, 5]);

function priorityFor(item, day) {
  if (item.noticePinned === 'first') return -10;
  if (day === 1 && item.noticeGroup === 'monday') return 0;
  if (DOCTRINAL_DAYS.has(day) && item.noticeGroup === 'doctrinal') return 0;
  if (item.noticeGroup === 'common') return 1;
  if (item.noticeGroup === 'monday' || item.noticeGroup === 'doctrinal') return 2;
  return 3;
}

export function prioritizeNoticesForDay(playlist, day = new Date().getDay()) {
  const noticeIndexes = [];
  const notices = [];

  playlist.forEach((item, index) => {
    if (item.type === 'notice' && !item.intro) {
      noticeIndexes.push(index);
      notices.push({ item, originalIndex: index });
    }
  });

  notices.sort((a, b) => {
    const priorityDifference = priorityFor(a.item, day) - priorityFor(b.item, day);
    return priorityDifference || a.originalIndex - b.originalIndex;
  });

  const ordered = [...playlist];
  noticeIndexes.forEach((playlistIndex, index) => {
    ordered[playlistIndex] = notices[index].item;
  });
  return ordered;
}
