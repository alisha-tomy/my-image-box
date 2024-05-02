from extensions import db


class Image(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, unique=False, nullable=False)
    url = db.Column(db.String, unique=True, nullable=False)
    boxes = db.relationship('Box', backref='image', lazy=True)
