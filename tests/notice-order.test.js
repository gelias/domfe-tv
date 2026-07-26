import assert from 'node:assert/strict';
import test from 'node:test';
import { prioritizeNoticesForDay } from '../src/core/notice-order.js';

const playlist = [
  { type: 'notice', intro: true, title: 'Capa' },
  { type: 'notice', title: 'Boas-vindas', noticePinned: 'first', noticeGroup: 'common' },
  { type: 'notice', title: 'Celular', noticeGroup: 'common' },
  { type: 'notice', title: 'Exposição', noticeGroup: 'doctrinal' },
  { type: 'notice', title: 'Desobsessão 1', noticeGroup: 'monday' },
  { type: 'notice', title: 'Desobsessão 2', noticeGroup: 'monday' },
  { type: 'notice', title: 'Geral' },
  { type: 'message', title: 'Depois' }
];

test('na segunda prioriza desobsessão, mantém boas-vindas primeiro e não remove avisos', () => {
  const ordered = prioritizeNoticesForDay(playlist, 1);
  assert.deepEqual(ordered.slice(1, 7).map(item => item.title), [
    'Boas-vindas', 'Desobsessão 1', 'Desobsessão 2', 'Celular', 'Exposição', 'Geral'
  ]);
  assert.equal(ordered.length, playlist.length);
  assert.equal(ordered.at(-1).title, 'Depois');
});

test('terça, quinta e sexta priorizam avisos das exposições doutrinárias', () => {
  for (const day of [2, 4, 5]) {
    const ordered = prioritizeNoticesForDay(playlist, day);
    assert.deepEqual(ordered.slice(1, 4).map(item => item.title), ['Boas-vindas', 'Exposição', 'Celular']);
  }
});
