"""Build text-based CV PDFs from the same content as the /cv route.

Requires reportlab and pypdf. Run from the repository root with Python 3.
The files contain contact details and belong only under the /cv path.
"""
import json
from pathlib import Path
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, KeepTogether
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
data = json.loads((ROOT / 'src/app/data/cv.json').read_text())
output = ROOT / 'public/cv'
output.mkdir(parents=True, exist_ok=True)
styles = {
    'name': ParagraphStyle('name', fontName='Helvetica-Bold', fontSize=25, leading=29, spaceAfter=4),
    'role': ParagraphStyle('role', fontName='Helvetica-Bold', fontSize=13, leading=17, spaceAfter=4, textColor=colors.HexColor('#354724')),
    'body': ParagraphStyle('body', fontName='Helvetica', fontSize=10, leading=13.4, spaceAfter=4, alignment=TA_LEFT),
    'heading': ParagraphStyle('heading', fontName='Helvetica-Bold', fontSize=11, leading=14, spaceBefore=11, spaceAfter=6, keepWithNext=True),
    'job': ParagraphStyle('job', fontName='Helvetica-Bold', fontSize=10, leading=13, spaceBefore=7, spaceAfter=3, keepWithNext=True),
    'meta': ParagraphStyle('meta', fontName='Helvetica', fontSize=8.8, leading=11.5, spaceAfter=5, textColor=colors.HexColor('#50564c'), keepWithNext=True),
    'contact': ParagraphStyle('contact', fontName='Helvetica', fontSize=8.8, leading=12, spaceAfter=2),
    'bullet': ParagraphStyle('bullet', fontName='Helvetica', fontSize=10, leading=13.4, leftIndent=10, firstLineIndent=-8, spaceAfter=3),
    'small': ParagraphStyle('small', fontName='Helvetica', fontSize=8.8, leading=11.5, spaceBefore=7, spaceAfter=3),
    'link': ParagraphStyle('link', fontName='Helvetica', fontSize=8.5, leading=11, spaceAfter=3, textColor=colors.HexColor('#354724')),
}

def para(text, style='body'):
    return Paragraph(escape(text), styles[style])

for key, variant in data['variants'].items():
    path = output / ('Stephen-Howe-' + variant['title'].replace(' ', '-') + '.pdf')
    doc = SimpleDocTemplate(str(path), pagesize=A4, rightMargin=16*mm, leftMargin=16*mm,
                            topMargin=13*mm, bottomMargin=13*mm,
                            title=f"Stephen Howe - {variant['title']} CV", author='Stephen Howe',
                            subject='Professional experience, selected projects, skills and education')
    story = [para(data['name'], 'name'), para(variant['title'], 'role'), para(data['location'], 'contact'),
             para(f"Email: {data['email']} | Portfolio: howecreative.co.uk", 'contact'),
             para('LinkedIn: linkedin.com/in/howestephen | GitHub: github.com/howestephen', 'contact'),
             para('Professional summary', 'heading'), para(variant['summary']), para('Professional experience', 'heading')]
    for job in data['experience']:
        block = [para(job['title'] + ' | ' + job['company'], 'job'),
                 para(job['dates'] + ' | ' + job['context'], 'meta')]
        block += [para('- ' + bullet, 'bullet') for bullet in job['bullets']]
        story.append(KeepTogether(block))
    story += [para(data['earlier'], 'small'), PageBreak(), para('Selected projects', 'heading')]
    for project_key in variant['projectOrder']:
        project = data['projects'][project_key]
        link = data['website'] + '/work/' + project['slug']
        block = [para(project['title'], 'job'), para(project['dates'], 'meta'), para(project['body']),
                 Paragraph(f'<link href="{escape(link)}">howecreative.co.uk/work/{project["slug"]}</link>', styles['link'])]
        story.append(KeepTogether(block))
    story.append(para('Core skills', 'heading'))
    for skill_key in variant['skillOrder']:
        skill = data['skills'][skill_key]
        story.append(Paragraph(f'<b>{escape(skill["title"])}:</b> {escape(skill["body"])}', styles['body']))
    story.append(para('Education', 'heading'))
    for item in data['education']:
        story.append(KeepTogether([para(item['title'], 'job'), para(item['detail'])]))
    story += [para('Languages', 'heading'), para(data['languages'])]
    doc.build(story)
    reader = PdfReader(path)
    text = '\n'.join(page.extract_text() for page in reader.pages)
    assert len(reader.pages) == 2, f'{key}: expected two pages, got {len(reader.pages)}'
    assert '\u25a0' not in text, f'{key}: missing font glyph'
    assert data['email'] in text and variant['title'] in text
    assert text.index('UNCX Network') < text.index('Switch Studios') < text.index('Howe Creative (Freelance)')
    for heading in ('Professional summary', 'Professional experience', 'Selected projects', 'Core skills', 'Education', 'Languages'):
        assert heading in text
    for name in ('React', 'Figma', 'TypeScript', 'Cinema 4D', 'Supabase'):
        assert name in text
    print(f'{path.name}: {len(reader.pages)} pages, {path.stat().st_size:,} bytes, text extraction passed')
