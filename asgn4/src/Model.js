class ObjModel {
  constructor() {
    this.matrix = new Matrix4();
    this.color = [0.72, 0.82, 0.95, 1.0];
    this.textureNum = -1;
    this.vertexBuffer = null;
    this.vertexCount = 0;
    this.ready = false;
  }

  load(gl, url, fallbackText) {
    var self = this;
    fetch(url)
      .then(function(response) {
        if (!response.ok) throw new Error('Could not fetch OBJ');
        return response.text();
      })
      .then(function(text) { self.parseAndUpload(gl, text); })
      .catch(function() { self.parseAndUpload(gl, fallbackText); });
  }

  parseAndUpload(gl, text) {
    var positions = [[0, 0, 0]];
    var normals = [[0, 1, 0]];
    var uvs = [[0, 0]];
    var data = [];
    var lines = text.split(/\r?\n/);

    function parseIndex(value, listLength) {
      var index = parseInt(value, 10);
      if (isNaN(index)) return 0;
      return index < 0 ? listLength + index : index;
    }

    function readVertex(token) {
      var pieces = token.split('/');
      var p = positions[parseIndex(pieces[0], positions.length)] || [0, 0, 0];
      var uv = pieces[1] ? (uvs[parseIndex(pieces[1], uvs.length)] || [0, 0]) : [0, 0];
      var n = pieces[2] ? (normals[parseIndex(pieces[2], normals.length)] || null) : null;
      return { p: p, uv: uv, n: n };
    }

    function cross(a, b) {
      return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
    }

    function normalize(v) {
      var len = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]) || 1;
      return [v[0] / len, v[1] / len, v[2] / len];
    }

    function subtract(a, b) {
      return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
    }

    function pushTriangle(a, b, c) {
      var computedNormal = normalize(cross(subtract(b.p, a.p), subtract(c.p, a.p)));
      [a, b, c].forEach(function(v) {
        var n = v.n || computedNormal;
        data.push(v.p[0], v.p[1], v.p[2], v.uv[0], v.uv[1], n[0], n[1], n[2]);
      });
    }

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i].trim();
      if (line === '' || line[0] === '#') continue;
      var parts = line.split(/\s+/);
      if (parts[0] === 'v') {
        positions.push([parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3])]);
      } else if (parts[0] === 'vn') {
        normals.push(normalize([parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3])]));
      } else if (parts[0] === 'vt') {
        uvs.push([parseFloat(parts[1]), parseFloat(parts[2])]);
      } else if (parts[0] === 'f') {
        var face = [];
        for (var j = 1; j < parts.length; j++) face.push(readVertex(parts[j]));
        for (var k = 1; k < face.length - 1; k++) pushTriangle(face[0], face[k], face[k + 1]);
      }
    }

    this.vertexBuffer = gl.createBuffer();
    this.vertexCount = data.length / 8;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
    this.ready = this.vertexCount > 0;
  }

  render(gl, uniforms) {
    if (!this.ready) return;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    var FSIZE = Float32Array.BYTES_PER_ELEMENT;
    gl.vertexAttribPointer(uniforms.a_Position, 3, gl.FLOAT, false, FSIZE * 8, 0);
    gl.enableVertexAttribArray(uniforms.a_Position);
    gl.vertexAttribPointer(uniforms.a_UV, 2, gl.FLOAT, false, FSIZE * 8, FSIZE * 3);
    gl.enableVertexAttribArray(uniforms.a_UV);
    gl.vertexAttribPointer(uniforms.a_Normal, 3, gl.FLOAT, false, FSIZE * 8, FSIZE * 5);
    gl.enableVertexAttribArray(uniforms.a_Normal);
    setObjectUniforms(gl, uniforms, this.matrix, this.color, this.textureNum);
    gl.drawArrays(gl.TRIANGLES, 0, this.vertexCount);
  }
}
