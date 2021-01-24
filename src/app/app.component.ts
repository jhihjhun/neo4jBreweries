import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import * as cytoscape from 'cytoscape';
import { ElementDefinition } from 'cytoscape';
import klay from 'cytoscape-klay';
import { combineLatest, Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';



type NodeShape = 'rectangle' | 'roundrectangle' | 'ellipse' | 'triangle'
  | 'pentagon' | 'hexagon' | 'heptagon' | 'octagon' | 'star' | 'barrel'
  | 'diamond' | 'vee' | 'rhomboid' | 'polygon' | 'tag' | 'round-rectangle'
  | 'round-triangle' | 'round-diamond' | 'round-pentagon' | 'round-hexagon'
  | 'round-heptagon' | 'round-octagon' | 'round-tag'
  | 'cut-rectangle' | 'bottom-round-rectangle' | 'concave-hexagon';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'neo4jBreweries';

  /**
   * 表單資料
   */
  formData = this.formBuilder.group({
    searchTarget: [null, Validators.required], // 查詢對象
    relationType: ['count'], // 關係類型，筆數或層數
    relationCount: [1, [Validators.min(1)]], // 關係數量
    relationMen: [null], // 關係人
    relationPowerItem: [], // 關係強弱
    relationPowerCount1: [[20, 40]], // 持股比例
    relationPowerCount2: [[0, 1000]], // 匯出入金額
    relationPowerCount3: [[20, 40]], // 進銷貨比例
  });


  // 測試資料，假設 neo4j 回傳的資料，僅有節點與關聯內容，節點的位置由前端繪圖時另外設定
  data = {
    results: [
      {
        columns: [
          'p'
        ],
        data: [
          {
            row: [
              [
                {
                  CUSTOMER_ID: 'C10004',
                  PERSON_TYPE: '2'
                },
                {
                  KEY_TO_PROD_02: '35'
                },
                {
                  CUSTOMER_ID: 'C10001',
                  PERSON_TYPE: '2'
                },
                {},
                {
                  CUSTOMER_ID: 'R10021',
                  PERSON_TYPE: '1'
                },
                {},
                {
                  CUSTOMER_ID: 'R10042',
                  PERSON_TYPE: '1'
                },
                {},
                {
                  CUSTOMER_ID: 'C10002',
                  PERSON_TYPE: '2'
                },
                {},
                {
                  CUSTOMER_ID: 'R10044',
                  PERSON_TYPE: '1'
                }
              ]
            ],
            meta: [
              [
                {
                  id: 201,
                  type: 'node',
                  deleted: false
                },
                {
                  id: 55,
                  type: 'relationship',
                  deleted: false
                },
                {
                  id: 194,
                  type: 'node',
                  deleted: false
                },
                {
                  id: 20,
                  type: 'relationship',
                  deleted: false
                },
                {
                  id: 218,
                  type: 'node',
                  deleted: false
                },
                {
                  id: 102,
                  type: 'relationship',
                  deleted: false
                },
                {
                  id: 239,
                  type: 'node',
                  deleted: false
                },
                {
                  id: 116,
                  type: 'relationship',
                  deleted: false
                },
                {
                  id: 242,
                  type: 'node',
                  deleted: false
                },
                {
                  id: 118,
                  type: 'relationship',
                  deleted: false
                },
                {
                  id: 241,
                  type: 'node',
                  deleted: false
                }
              ]
            ],
            graph: {
              nodes: [
                {
                  id: '241',
                  labels: [
                    'Customer'
                  ],
                  properties: {
                    CUSTOMER_ID: 'R10044',
                    PERSON_TYPE: '1'
                  }
                },
                {
                  id: '194',
                  labels: [
                    'Customer'
                  ],
                  properties: {
                    CUSTOMER_ID: 'C10001',
                    PERSON_TYPE: '2'
                  }
                },
                {
                  id: '242',
                  labels: [
                    'Customer'
                  ],
                  properties: {
                    CUSTOMER_ID: 'C10002',
                    PERSON_TYPE: '2'
                  }
                },
                {
                  id: '201',
                  labels: [
                    'Customer'
                  ],
                  properties: {
                    CUSTOMER_ID: 'C10004',
                    PERSON_TYPE: '2'
                  }
                },
                {
                  id: '218',
                  labels: [
                    'Customer'
                  ],
                  properties: {
                    CUSTOMER_ID: 'R10021',
                    PERSON_TYPE: '1'
                  }
                },
                {
                  id: '239',
                  labels: [
                    'Customer'
                  ],
                  properties: {
                    CUSTOMER_ID: 'R10042',
                    PERSON_TYPE: '1'
                  }
                }
              ],
              relationships: [
                {
                  id: '20',
                  type: '雇傭',
                  startNode: '194',
                  endNode: '218',
                  properties: {}
                },
                {
                  id: '116',
                  type: '雇傭',
                  startNode: '242',
                  endNode: '239',
                  properties: {}
                },
                {
                  id: '102',
                  type: '家人',
                  startNode: '239',
                  endNode: '218',
                  properties: {}
                },
                {
                  id: '118',
                  type: '雇傭',
                  startNode: '242',
                  endNode: '241',
                  properties: {}
                },
                {
                  id: '55',
                  type: '合併',
                  startNode: '201',
                  endNode: '194',
                  properties: {
                    KEY_TO_PROD_02: '35'
                  }
                }
              ]
            }
          }
        ]
      }
    ],
    errors: []
  };

  cy: cytoscape.Core;

  layoutOptions = {
    name: 'klay',

    nodeDimensionsIncludeLabels: false, // Boolean which changes whether label dimensions are included when calculating node dimensions
    fit: true, // Whether to fit
    padding: 10, // Padding on fit
    animate: false, // Whether to transition the node positions
    animateFilter: function (node, i) { return true; }, // Whether to animate specific nodes when animation is on; non-animated nodes immediately go to their final positions
    animationDuration: 500, // Duration of animation in ms if enabled
    animationEasing: undefined, // Easing of animation if enabled
    transform: function (node, pos) { return pos; }, // A function that applies a transform to the final node position
    ready: undefined, // Callback on layoutready
    stop: undefined, // Callback on layoutstop
    klay: {
      // Following descriptions taken from http://layout.rtsys.informatik.uni-kiel.de:9444/Providedlayout.html?algorithm=de.cau.cs.kieler.klay.layered
      addUnnecessaryBendpoints: false, // Adds bend points even if an edge does not change direction.
      aspectRatio: 1.6, // The aimed aspect ratio of the drawing, that is the quotient of width by height
      borderSpacing: 20, // Minimal amount of space to be left to the border
      compactComponents: false, // Tries to further compact components (disconnected sub-graphs).
      crossingMinimization: 'LAYER_SWEEP', // Strategy for crossing minimization.
      /* LAYER_SWEEP The layer sweep algorithm iterates multiple times over the layers, trying to find node orderings that minimize the number of crossings. The algorithm uses randomization to increase the odds of finding a good result. To improve its results, consider increasing the Thoroughness option, which influences the number of iterations done. The Randomization seed also influences results.
      INTERACTIVE Orders the nodes of each layer by comparing their positions before the layout algorithm was started. The idea is that the relative order of nodes as it was before layout was applied is not changed. This of course requires valid positions for all nodes to have been set on the input graph before calling the layout algorithm. The interactive layer sweep algorithm uses the Interactive Reference Point option to determine which reference point of nodes are used to compare positions. */
      cycleBreaking: 'GREEDY', // Strategy for cycle breaking. Cycle breaking looks for cycles in the graph and determines which edges to reverse to break the cycles. Reversed edges will end up pointing to the opposite direction of regular edges (that is, reversed edges will point left if edges usually point right).
      /* GREEDY This algorithm reverses edges greedily. The algorithm tries to avoid edges that have the Priority property set.
      INTERACTIVE The interactive algorithm tries to reverse edges that already pointed leftwards in the input graph. This requires node and port coordinates to have been set to sensible values.*/
      direction: 'UNDEFINED', // Overall direction of edges: horizontal (right / left) or vertical (down / up)
      /* UNDEFINED, RIGHT, LEFT, DOWN, UP */
      edgeRouting: 'ORTHOGONAL', // Defines how edges are routed (POLYLINE, ORTHOGONAL, SPLINES)
      edgeSpacingFactor: 0.5, // Factor by which the object spacing is multiplied to arrive at the minimal spacing between edges.
      feedbackEdges: false, // Whether feedback edges should be highlighted by routing around the nodes.
      fixedAlignment: 'NONE', // Tells the BK node placer to use a certain alignment instead of taking the optimal result.  This option should usually be left alone.
      /* NONE Chooses the smallest layout from the four possible candidates.
      LEFTUP Chooses the left-up candidate from the four possible candidates.
      RIGHTUP Chooses the right-up candidate from the four possible candidates.
      LEFTDOWN Chooses the left-down candidate from the four possible candidates.
      RIGHTDOWN Chooses the right-down candidate from the four possible candidates.
      BALANCED Creates a balanced layout from the four possible candidates. */
      inLayerSpacingFactor: 1.0, // Factor by which the usual spacing is multiplied to determine the in-layer spacing between objects.
      layoutHierarchy: false, // Whether the selected layouter should consider the full hierarchy
      linearSegmentsDeflectionDampening: 0.3, // Dampens the movement of nodes to keep the diagram from getting too large.
      mergeEdges: false, // Edges that have no ports are merged so they touch the connected nodes at the same points.
      mergeHierarchyCrossingEdges: true, // If hierarchical layout is active, hierarchy-crossing edges use as few hierarchical ports as possible.
      nodeLayering: 'NETWORK_SIMPLEX', // Strategy for node layering.
      /* NETWORK_SIMPLEX This algorithm tries to minimize the length of edges. This is the most computationally intensive algorithm. The number of iterations after which it aborts if it hasn't found a result yet can be set with the Maximal Iterations option.
      LONGEST_PATH A very simple algorithm that distributes nodes along their longest path to a sink node.
      INTERACTIVE Distributes the nodes into layers by comparing their positions before the layout algorithm was started. The idea is that the relative horizontal order of nodes as it was before layout was applied is not changed. This of course requires valid positions for all nodes to have been set on the input graph before calling the layout algorithm. The interactive node layering algorithm uses the Interactive Reference Point option to determine which reference point of nodes are used to compare positions. */
      nodePlacement: 'BRANDES_KOEPF', // Strategy for Node Placement
      /* BRANDES_KOEPF Minimizes the number of edge bends at the expense of diagram size: diagrams drawn with this algorithm are usually higher than diagrams drawn with other algorithms.
      LINEAR_SEGMENTS Computes a balanced placement.
      INTERACTIVE Tries to keep the preset y coordinates of nodes from the original layout. For dummy nodes, a guess is made to infer their coordinates. Requires the other interactive phase implementations to have run as well.
      SIMPLE Minimizes the area at the expense of... well, pretty much everything else. */
      randomizationSeed: 1, // Seed used for pseudo-random number generators to control the layout algorithm; 0 means a new seed is generated
      routeSelfLoopInside: false, // Whether a self-loop is routed around or inside its node.
      separateConnectedComponents: true, // Whether each connected component should be processed separately
      spacing: 100, // Overall setting for the minimal amount of space to be left between objects
      thoroughness: 7 // How much effort should be spent to produce a nice layout..
    },
    priority: function (edge) { return null; }, // Edges with a non-nil value are skipped when greedy edge cycle breaking is enabled
  } as cytoscape.LayoutOptions;

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient) { }

  ngOnInit(): void {


    cytoscape.use(klay);

    this.cy = cytoscape({
      container: document.getElementById('cy'),
      style: [
        {
          selector: 'node',
          css: {
            // 圖形，可直接設定圖形類型，例如 rectangle，或動態從 data 物件下取得指定屬性，如下
            shape: 'data(shape)' as NodeShape,
            label: function (ele) {
              const eleData = ele.data() as cytoscape.NodeDataDefinition;

              if (eleData.labels[0] === 'Style') {
                return eleData.properties.style;
              }

              if (eleData.labels[0] === 'Beer') {
                return eleData.properties.name;
              }

              return 'aaa';
            }, // 文字標籤
            'text-valign': 'top', // 文字標籤位置
            'text-halign': 'center', // 文字標籤位置
            'font-size': '6px',
            width: 20,
            height: 20
          }
        },
        {
          selector: 'edge',
          css: {
            'curve-style': 'bezier', // edge 類型
            'target-arrow-shape': 'triangle', // edge 箭頭圖形
            width: 3, // 寬度
            label: function (ele) {
              const eleData = ele.data() as cytoscape.EdgeDataDefinition;
              return eleData.type;
            }, // 文字標籤,
            'font-size': '6px',
            'text-wrap': 'wrap'
          }
        },
      ],
    });


  }

  search(): void {


    console.log(this.formData.value);

    const searchTargetId = this.formData.get('searchTarget').value;

    this.cy.nodes().remove();
    this.cy.edges().remove();

    const $ = this.initData()
      .pipe(
        mergeMap(neo4jData => {
          return combineLatest([
            this.draw(neo4jData),
            this.bindNodeOnEvent()
          ]);
        })
      );

    $.subscribe();
  }

  private draw(neo4jData: any): Observable<void> {

    return new Observable((observer) => {
      console.log(neo4jData);
      neo4jData.results.forEach(result => {
        result.data.forEach(data => {
          const g = data.graph;
          const cyNodes = g.nodes.map(element => ({
            group: 'nodes',
            data: {
              id: element.id,
              shape: 'ellipse',
              labels: element.labels,
              properties: element.properties

            }
          })) as ElementDefinition[];

          const cyEdges = g.relationships.map(element => ({
            group: 'edges',
            data: {
              id: element.id,
              source: element.startNode,
              target: element.endNode,
              type: element.type,
              mergeValue: element.properties.KEY_TO_PROD_02, // 合併比例
              salePercent: element.properties.KEY_TO_PROD_03, // 銷貨比例
              saleValue: element.properties.KEY_TO_PROD_04, // 銷售金額
              relDesc: element.properties.REL_DESC // 關係描述
            }
          })) as ElementDefinition[];

          this.cy.add(cyNodes);
          this.cy.add(cyEdges);
        });
      });

      observer.next();
      observer.complete();
    });
  }

  private bindNodeOnEvent(): Observable<any> {
    return new Observable((observer) => {
      this.cy.nodes().removeListener('click');
      this.cy.nodes().on('click', (e) => {

        const $ = this.getExtension(e.target._private.data.customerId)
          .pipe(
            mergeMap(neo4jData => {
              return combineLatest([
                this.draw(neo4jData),
                this.bindNodeOnEvent()
              ]);
            })
          );

        $.subscribe();
      });

      // 依照現有 node 重新排列 layout
      this.cy.layout(this.layoutOptions).run();
      observer.next();
      observer.complete();
    });
  }

  /**
   * 初始化資料
   */
  private initData(): Observable<any> {

    const inputValue = this.formData.value;

    const body = {
      statements: [{
        statement: this.getCypher(inputValue),
        parameters: null,
        resultDataContents: ['row', 'graph']
      }]
    };

    return this.http.post<any>(environment.apiTarget, body, {
      headers: new HttpHeaders().set('Authorization', 'Basic ' + btoa(`${environment.neo4jAccount}` + ':' + `${environment.neo4jPassword}`))
    });
  }

  /**
   * 取得外部關聯
   * @param customerId 客戶 id
   */
  private getExtension(customerId: string): Observable<any> {
    const queryId = customerId;

    const query = `match p=(m{CUSTOMER_ID:'${queryId}'})-[]-() return p`;
    const body = {
      statements: [{
        statement: query,
        resultDataContents: ['row', 'graph']
      }]
    };

    return this.http.post<any>(environment.apiTarget, body, {
      headers: new HttpHeaders().set('Authorization', 'Basic ' + btoa(`${environment.neo4jAccount}` + ':' + `${environment.neo4jPassword}`))
    });
  }

  /**
  * 組織cypher語法
  * @param p formdata
  */
  getCypher(p: any): string {
    let cypher = 'MATCH p=()-[r:BEER_STYLE]->() RETURN p LIMIT 25';

    return cypher;
  }
}
