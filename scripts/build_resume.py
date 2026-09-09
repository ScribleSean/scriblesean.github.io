"""Generate the public, one-page resume from the same curated data as the site."""
import json
from pathlib import Path
from xml.sax.saxutils import escape
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT, TA_RIGHT
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.utils import simpleSplit
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, KeepTogether
from reportlab.lib.pagesizes import letter

ROOT = Path(__file__).resolve().parents[1]
data = json.loads((ROOT / 'data/resume.json').read_text())
OUTPUT = ROOT / 'public/resume/sean-arackal-resume.pdf'
OUTPUT.parent.mkdir(parents=True, exist_ok=True)
INK = colors.HexColor('#202923')
MUTED = colors.HexColor('#536052')
RULE = colors.HexColor('#bdc6b8')
styles = {
    'name': ParagraphStyle('name', fontName='Helvetica-Bold', fontSize=22, leading=25, textColor=INK, spaceAfter=5),
    'contact': ParagraphStyle('contact', fontName='Helvetica', fontSize=8.5, leading=12, textColor=MUTED),
    'section': ParagraphStyle('section', fontName='Helvetica-Bold', fontSize=9, leading=12, textColor=INK, spaceBefore=12, spaceAfter=5),
    'title': ParagraphStyle('title', fontName='Helvetica-Bold', fontSize=9.7, leading=12, textColor=INK),
    'date': ParagraphStyle('date', fontName='Helvetica', fontSize=8.2, leading=11, textColor=MUTED, alignment=TA_RIGHT),
    'meta': ParagraphStyle('meta', fontName='Helvetica', fontSize=8.4, leading=11, textColor=MUTED, spaceAfter=3),
    'body': ParagraphStyle('body', fontName='Helvetica', fontSize=9, leading=12, textColor=INK),
    'bullet': ParagraphStyle('bullet', fontName='Helvetica', fontSize=9, leading=12, textColor=INK, leftIndent=9, firstLineIndent=-7, spaceAfter=2),
}

def clean(text):
    return escape(text.replace('’', "'").replace('–', '-').replace('—', '-'))

def para(text, style='body'):
    return Paragraph(clean(text), styles[style])

def link(url, label):
    return f'<link href="{escape(url)}" color="#334a35">{clean(label)}</link>'

def section(title):
    return [Paragraph(title.upper(), styles['section']), Table([['']], colWidths=[516], rowHeights=[1], style=TableStyle([('BACKGROUND',(0,0),(-1,-1),RULE)])), Spacer(1,5)]

def entry_title(title, date):
    table = Table([[para(title,'title'),para(date,'date')]], colWidths=[338,178])
    table.setStyle(TableStyle([('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),0),('RIGHTPADDING',(0,0),(-1,-1),0),('TOPPADDING',(0,0),(-1,-1),0),('BOTTOMPADDING',(0,0),(-1,-1),1)]))
    return table

story=[]
c=data['contact']; e=data['education']
story.append(para(c['name'],'name'))
story.append(Paragraph(' | '.join([clean(c['location']),link('mailto:'+c['email'],c['email']),clean(c['phone'])]),styles['contact']))
story.append(Paragraph(' | '.join([link(c['portfolio'],'scriblesean.github.io/portfolio'),link(c['github'],'github.com/ScribleSean'),link(c['linkedin'],'linkedin.com/in/seanarackal')]),styles['contact']))
story += section('Education')
story.append(entry_title(e['institution'],'May 2026'))
story.append(para(f"{e['degree']} | {e['honors']} | GPA: {e['gpa']}",'body'))
story += section('Technical skills')
story.append(para('Languages: Python, TypeScript, JavaScript, Java, C/C++, SQL'))
story.append(para('Tools: React, Next.js, PostgreSQL, PyTorch, YOLO, Git, Docker; semantic search'))
story += section('Selected projects')
for project in data['projects']:
    entry=[entry_title(project['name'],project['period']),para(project['role'],'meta')]
    for bullet in project['outcomes']:
        entry.append(para('- '+bullet,'bullet'))
    entry.append(Spacer(1,6))
    story.append(KeepTogether(entry))
story += section('Professional experience')
for job in data['resumeExperience']:
    entry=[entry_title(job['company'],job['period']),para(job['role']+' | '+job['location'],'meta'),para('- '+job['details'],'bullet')]
    if job.get('progression'):
        entry.append(para(job['progression'],'meta'))
    entry.append(Spacer(1,4))
    story.append(KeepTogether(entry))

doc=SimpleDocTemplate(str(OUTPUT),pagesize=letter,rightMargin=48,leftMargin=48,topMargin=36,bottomMargin=35,title='Sean Arackal - Resume',author='Sean Arackal',pageCompression=1)
doc.build(story)
print(OUTPUT)
