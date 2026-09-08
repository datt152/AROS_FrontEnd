import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'

const root = process.cwd()
const base = path.join(root, 'public', 'templates', '_xlsx_build')
const out = path.join(root, 'public', 'templates', 'students-import.xlsx')

fs.rmSync(base, { recursive: true, force: true })
fs.mkdirSync(path.join(base, '_rels'), { recursive: true })
fs.mkdirSync(path.join(base, 'xl', '_rels'), { recursive: true })
fs.mkdirSync(path.join(base, 'xl', 'worksheets'), { recursive: true })

fs.writeFileSync(
  path.join(base, '[Content_Types].xml'),
  `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
</Types>`,
)

fs.writeFileSync(
  path.join(base, '_rels', '.rels'),
  `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`,
)

fs.writeFileSync(
  path.join(base, 'xl', 'workbook.xml'),
  `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="Students" sheetId="1" r:id="rId1"/>
  </sheets>
</workbook>`,
)

fs.writeFileSync(
  path.join(base, 'xl', '_rels', 'workbook.xml.rels'),
  `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
</Relationships>`,
)

fs.writeFileSync(
  path.join(base, 'xl', 'worksheets', 'sheet1.xml'),
  `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetData>
    <row r="1">
      <c r="A1" t="inlineStr"><is><t>email</t></is></c>
      <c r="B1" t="inlineStr"><is><t>fullName</t></is></c>
      <c r="C1" t="inlineStr"><is><t>studentCode</t></is></c>
    </row>
    <row r="2">
      <c r="A2" t="inlineStr"><is><t>sv1@school.edu.vn</t></is></c>
      <c r="B2" t="inlineStr"><is><t>Nguyen Van A</t></is></c>
      <c r="C2" t="inlineStr"><is><t>12345678</t></is></c>
    </row>
    <row r="3">
      <c r="A3" t="inlineStr"><is><t>sv2@school.edu.vn</t></is></c>
      <c r="B3" t="inlineStr"><is><t>Tran Thi B</t></is></c>
    </row>
  </sheetData>
</worksheet>`,
)

const zipPath = `${out}.zip`
fs.rmSync(out, { force: true })
fs.rmSync(zipPath, { force: true })

execFileSync(
  'powershell',
  ['-NoProfile', '-Command', `Compress-Archive -Path '${base}\\*' -DestinationPath '${zipPath}' -Force`],
  { stdio: 'inherit' },
)

fs.renameSync(zipPath, out)
fs.rmSync(base, { recursive: true, force: true })
console.log('Wrote', out, fs.statSync(out).size, 'bytes')
