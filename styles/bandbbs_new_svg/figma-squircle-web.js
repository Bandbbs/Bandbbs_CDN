// figma-squircle-web.js
// 适用于 XenForo 的 Figma 平滑圆角实现（clip-path）
// 圆角固定为 16px，自动适配任意宽高

(function () {
    'use strict';

    function toRadians(degrees) {
        return (degrees * Math.PI) / 180;
    }

    function f(num) {
        // 格式化数字，保留4位小数，去除尾随0（可选），但确保是字符串
        return num.toFixed(4).replace(/\.?0+$/, '');
    }

    function getPathParamsForCorner(params) {
        var cornerRadius = params.cornerRadius;
        var cornerSmoothing = params.cornerSmoothing;
        var preserveSmoothing = params.preserveSmoothing;
        var roundingAndSmoothingBudget = params.roundingAndSmoothingBudget;

        var p = (1 + cornerSmoothing) * cornerRadius;

        if (!preserveSmoothing) {
            var maxCornerSmoothing = roundingAndSmoothingBudget / cornerRadius - 1;
            cornerSmoothing = Math.min(cornerSmoothing, Math.max(0, maxCornerSmoothing));
            p = Math.min(p, roundingAndSmoothingBudget);
        }

        var arcMeasure = 90 * (1 - cornerSmoothing);
        var arcSectionLength = Math.sin(toRadians(arcMeasure / 2)) * cornerRadius * Math.sqrt(2);
        var angleAlpha = (90 - arcMeasure) / 2;
        var p3ToP4Distance = cornerRadius * Math.tan(toRadians(angleAlpha / 2));
        var angleBeta = 45 * cornerSmoothing;
        var c = p3ToP4Distance * Math.cos(toRadians(angleBeta));
        var d = c * Math.tan(toRadians(angleBeta));

        var b = (p - arcSectionLength - c - d) / 3;
        var a = 2 * b;

        if (preserveSmoothing && p > roundingAndSmoothingBudget) {
            var p1ToP3MaxDistance = roundingAndSmoothingBudget - d - arcSectionLength - c;
            var minA = p1ToP3MaxDistance / 6;
            var maxB = p1ToP3MaxDistance - minA;
            b = Math.min(b, maxB);
            a = p1ToP3MaxDistance - b;
            p = roundingAndSmoothingBudget;
        }

        return { a: a, b: b, c: c, d: d, p: p, cornerRadius: cornerRadius, arcSectionLength: arcSectionLength };
    }

    function drawTopRightPath(p) {
        if (p.cornerRadius) {
            return 'c ' + f(p.a) + ' 0 ' + f(p.a + p.b) + ' 0 ' + f(p.a + p.b + p.c) + ' ' + f(p.d) +
                ' a ' + f(p.cornerRadius) + ' ' + f(p.cornerRadius) + ' 0 0 1 ' + f(p.arcSectionLength) + ' ' + f(p.arcSectionLength) +
                ' c ' + f(p.d) + ' ' + f(p.c) + ' ' + f(p.d) + ' ' + f(p.b + p.c) + ' ' + f(p.d) + ' ' + f(p.a + p.b + p.c);
        } else {
            return 'l ' + f(p.p) + ' 0';
        }
    }

    function drawBottomRightPath(p) {
        if (p.cornerRadius) {
            return 'c 0 ' + f(p.a) + ' 0 ' + f(p.a + p.b) + ' ' + f(-p.d) + ' ' + f(p.a + p.b + p.c) +
                ' a ' + f(p.cornerRadius) + ' ' + f(p.cornerRadius) + ' 0 0 1 ' + f(-p.arcSectionLength) + ' ' + f(p.arcSectionLength) +
                ' c ' + f(-p.c) + ' ' + f(p.d) + ' ' + f(-(p.b + p.c)) + ' ' + f(p.d) + ' ' + f(-(p.a + p.b + p.c)) + ' ' + f(p.d);
        } else {
            return 'l 0 ' + f(p.p);
        }
    }

    function drawBottomLeftPath(p) {
        if (p.cornerRadius) {
            return 'c ' + f(-p.a) + ' 0 ' + f(-(p.a + p.b)) + ' 0 ' + f(-(p.a + p.b + p.c)) + ' ' + f(-p.d) +
                ' a ' + f(p.cornerRadius) + ' ' + f(p.cornerRadius) + ' 0 0 1 ' + f(-p.arcSectionLength) + ' ' + f(-p.arcSectionLength) +
                ' c ' + f(-p.d) + ' ' + f(-p.c) + ' ' + f(-p.d) + ' ' + f(-(p.b + p.c)) + ' ' + f(-p.d) + ' ' + f(-(p.a + p.b + p.c));
        } else {
            return 'l ' + f(-p.p) + ' 0';
        }
    }

    function drawTopLeftPath(p) {
        if (p.cornerRadius) {
            return 'c 0 ' + f(-p.a) + ' 0 ' + f(-(p.a + p.b)) + ' ' + f(p.d) + ' ' + f(-(p.a + p.b + p.c)) +
                ' a ' + f(p.cornerRadius) + ' ' + f(p.cornerRadius) + ' 0 0 1 ' + f(p.arcSectionLength) + ' ' + f(-p.arcSectionLength) +
                ' c ' + f(p.c) + ' ' + f(-p.d) + ' ' + f(p.b + p.c) + ' ' + f(-p.d) + ' ' + f(p.a + p.b + p.c) + ' ' + f(-p.d);
        } else {
            return 'l 0 ' + f(-p.p);
        }
    }

    function getSVGPathFromPathParams(params) {
        var w = params.width;
        var h = params.height;
        var tl = params.topLeftPathParams;
        var tr = params.topRightPathParams;
        var bl = params.bottomLeftPathParams;
        var br = params.bottomRightPathParams;

        var path = [
            'M', f(w - tr.p), '0',
            drawTopRightPath(tr),
            'L', f(w), f(h - br.p),
            drawBottomRightPath(br),
            'L', f(bl.p), f(h),
            drawBottomLeftPath(bl),
            'L', '0', f(tl.p),
            drawTopLeftPath(tl),
            'Z'
        ].join(' ');

        return path.replace(/\s+/g, ' ').trim();
    }

    function getSquirclePath(width, height, cornerRadius, cornerSmoothing) {
        var budget = Math.min(width, height) / 2;
        var actualRadius = Math.min(cornerRadius, budget);
        var pathParams = getPathParamsForCorner({
            cornerRadius: actualRadius,
            cornerSmoothing: cornerSmoothing,
            preserveSmoothing: false,
            roundingAndSmoothingBudget: budget
        });
        return getSVGPathFromPathParams({
            width: width,
            height: height,
            topLeftPathParams: pathParams,
            topRightPathParams: pathParams,
            bottomLeftPathParams: pathParams,
            bottomRightPathParams: pathParams
        });
    }

    window.applyFigmaSquircle = function (element, cornerRadius, cornerSmoothing) {
        if (cornerRadius === undefined) cornerRadius = 16;
        if (cornerSmoothing === undefined) cornerSmoothing = 1;

        var rect = element.getBoundingClientRect();
        var width = rect.width;
        var height = rect.height;

        if (width <= 0 || height <= 0) return;

        var pathData = getSquirclePath(width, height, cornerRadius, cornerSmoothing);
        var id = 'squircle-' + Math.random().toString(36).substr(2, 9);

        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '0');
        svg.setAttribute('height', '0');
        svg.style.position = 'absolute';
        svg.style.pointerEvents = 'none';

        var clipPath = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath');
        clipPath.setAttribute('id', id);
        clipPath.setAttribute('clipPathUnits', 'objectBoundingBox');

        var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', pathData);
        path.setAttribute('transform', 'scale(' + (1 / width) + ' ' + (1 / height) + ')');

        clipPath.appendChild(path);
        svg.appendChild(clipPath);
        document.body.appendChild(svg);

        element.style.clipPath = 'url(#' + id + ')';
        element.style.webkitClipPath = 'url(#' + id + ')';
    };

    window.initFigmaSquircles = function () {
        document.querySelectorAll('.figma-squircle').forEach(function (el) {
            var radius = parseFloat(el.dataset.cornerRadius) || 16;
            var smoothing = parseFloat(el.dataset.smoothing) || 0.6;
            window.applyFigmaSquircle(el, radius, smoothing);
        });
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', window.initFigmaSquircles);
    } else {
        window.initFigmaSquircles();
    }

})();