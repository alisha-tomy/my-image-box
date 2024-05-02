from extensions import db


class Box(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    image_id = db.Column(db.Integer, db.ForeignKey("image.id"), nullable=False)
    top_left_x = db.Column(db.Integer, nullable=False)
    top_left_y = db.Column(db.Integer, nullable=False)
    bottom_right_x = db.Column(db.Integer, nullable=False)
    bottom_right_y = db.Column(db.Integer, nullable=False)
