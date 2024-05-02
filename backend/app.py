import uuid
import json

from flask import Flask, request, redirect, url_for
from extensions import db
from models.images import Image
from models.boxes import Box
from werkzeug.utils import secure_filename
from flask_cors import CORS, cross_origin


ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

app = Flask(__name__,
            static_url_path='',
            static_folder='static')
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///project.db"
db.init_app(app)
CORS(app, origins=['http://localhost:3000/'])


with app.app_context():
    db.create_all()


@app.route("/overview")
@cross_origin()
def overview():
    images = Image.query.all()
    return {"images": [{"id": image.id, "name": image.name}
                       for image in images]}


# Route for testing image url in browser
@app.route("/view/<int:image_id>")
@cross_origin()
def view(image_id):
    image = Image.query.get(image_id)
    if image is None:
        return {"error": "Image not found"}, 404
    return redirect(url_for('static', filename=image.url))


@app.route("/load/<int:image_id>")
@cross_origin()
def load(image_id):
    image = Image.query.get(image_id)
    if image is None:
        return {"error": "Image not found"}, 404
    boxes = image.boxes
    return {
            "id": image.id,
            "name": image.name,
            "url": image.url,
            "boxes": [{"startX": box.top_left_x, "startY": box.top_left_y,
                       "endX": box.bottom_right_x, "endY": box.bottom_right_y}
                      for box in boxes]
        }


@app.route("/save", methods=["POST"])
@cross_origin()
def update_image():
    if "image_id" in request.form:
        # update existing image
        image_id = request.form["image_id"]
        image = Image.query.get(image_id)
        if image is None:
            return {"error": "Image not found"}, 404
    elif "file" in request.files:
        # upload new image
        file = request.files["file"]
        if file.filename == "":
            return {"error": "No file selected"}, 400
        filename = secure_filename(file.filename)
        file_extension = filename.split(".")[-1]
        if file_extension.lower() not in ALLOWED_EXTENSIONS:
            return {"error": "Invalid file extension"}, 400

        file_name_to_save = f"{uuid.uuid4()}.{file_extension}"
        file.save(f"static/{file_name_to_save}")

        image = Image(name=filename, url=file_name_to_save)
    else:
        return {"status": False, "message": "Invalid request"}, 400

    try:
        boxes_json = request.form.get('boxes')
        if boxes_json:
            boxes = json.loads(boxes_json)
    except json.JSONDecodeError:
        return {"error": "Invalid boxes JSON"}, 400
    # delete existing boxes before updating
    for box in image.boxes:
        db.session.delete(box)

    image.boxes = []
    for box in boxes:
        image.boxes.append(Box(top_left_x=box["startX"],
                               top_left_y=box["startY"],
                               bottom_right_x=box["endX"],
                               bottom_right_y=box["endY"]))

    db.session.add(image)
    db.session.commit()

    return {"status": True, "message": "Image updated successfully"}
