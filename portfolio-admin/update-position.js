db.settings.updateOne({}, {$set: {position: '60180 Nogent-sur-Oise'}}, {upsert: true});
print('Position field added successfully!');