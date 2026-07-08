const fs = require('fs');
let code = fs.readFileSync('src/components/Map3D.tsx', 'utf8');

const markerCode = `
    map.current.once('load', () => {
      weatherPoints.forEach(wp => {
        const el = document.createElement('div');
        el.className = 'w-7 h-7 rounded-full flex items-center justify-center border-2 border-white shadow-md relative cursor-pointer hover:scale-110 transition-transform';
        
        let bgColor = 'bg-[#94a3b8]'; // none
        if (wp.status === 'ready') bgColor = 'bg-[#84b676]';
        else if (wp.status === 'operating') bgColor = 'bg-[#e3d122]';
        else if (wp.status === 'completed') bgColor = 'bg-[#8b10ec]';
        else if (wp.status === 'canceled') bgColor = 'bg-[#df5a5a]';

        const root = createRoot(el);
        const Icon = wp.type === 'rocket' ? Rocket : (wp.type === 'gun' ? Target : Truck);
        
        root.render(
          <div className={\`relative w-full h-full rounded-full flex items-center justify-center text-white \${bgColor}\`}>
            <Icon className="w-4 h-4" />
            {wp.mobility === 'mobile' && <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-500 rounded-full border border-white" title="移动点" />}
            {wp.mobility === 'temporary' && <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-orange-500 rounded-full border border-white" title="临时点" />}
          </div>
        );

        new maplibregl.Marker({ element: el })
          .setLngLat(wp.coord as [number, number])
          .setPopup(new maplibregl.Popup({ offset: 15, closeButton: false }).setHTML(\`
            <div class="p-2 min-w-[120px]">
              <h3 class="font-bold text-sm mb-1 text-slate-800">\${wp.name}</h3>
              <div class="flex flex-col gap-1">
                <p class="text-xs text-slate-600 flex items-center justify-between">
                  <span>状态</span>
                  <span class="font-bold px-1.5 py-0.5 rounded-sm bg-slate-100 \${
                    wp.status === 'ready' ? 'text-[#84b676]' : 
                    wp.status === 'operating' ? 'text-[#e3d122]' : 
                    wp.status === 'completed' ? 'text-[#8b10ec]' : 
                    wp.status === 'canceled' ? 'text-[#df5a5a]' : 'text-[#94a3b8]'
                  }">\${
                    wp.status === 'ready' ? '就绪' : 
                    wp.status === 'operating' ? '作业' : 
                    wp.status === 'completed' ? '完成' : 
                    wp.status === 'canceled' ? '取消' : '无状态'
                  }</span>
                </p>
                <p class="text-xs text-slate-600 flex items-center justify-between">
                  <span>类型</span>
                  <span class="font-medium text-slate-700">\${wp.type === 'rocket' ? '火箭弹' : wp.type === 'gun' ? '高炮' : '作业车'}</span>
                </p>
                <p class="text-xs text-slate-600 flex items-center justify-between">
                  <span>机动性</span>
                  <span class="font-medium text-slate-700">\${wp.mobility === 'fixed' ? '固定' : wp.mobility === 'temporary' ? '临时' : '移动'}</span>
                </p>
              </div>
            </div>
          \`))
          .addTo(map.current!);
      });
    });
`;

code = code.replace(
  "      'bottom-right'\n    );",
  "      'bottom-right'\n    );\n" + markerCode
);

fs.writeFileSync('src/components/Map3D.tsx', code);
console.log('done');
