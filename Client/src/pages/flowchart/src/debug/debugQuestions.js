const debugQuestions = [
	{
		id: "debug-001",
		title: "Pass-Based Reordering Routine",
		codeTemplate: [
			"void routine(int x[], int m) {",
			"    int flag;",
			"    for(int p = 0; p < m - 1; p++) {",
			"        flag = 0;",
			"        for(int q = 0; q < ___1___; q++) {",
			"            if(x[q] ___2___ x[q + 1]) {",
			"                int hold = x[q];",
			"                x[q] = x[q + 1];",
			"                x[q + 1] = hold;",
			"                flag = 1;",
			"            }",
			"        }",
			"        if(flag == ___3___) {",
			"            break;",
			"        }",
			"    }",
			"    if(m ___4___ 1) {",
			"        return;",
			"    }",
			"}"
		],
		answers: ["m-p-1", ">", "0", "<="],
		marksPerBlank: 5
	},
	{
		id: "debug-002",
		title: "Grid Product Accumulator",
		codeTemplate: [
			"void transform(int A[20][20], int B[20][20], int C[20][20], int z) {",
			"    if(z ___1___ 0) return;",
			"",
			"    for(int r = 0; r < z; r++) {",
			"        for(int s = 0; s < z; s++) {",
			"            C[r][s] = 0;",
			"            for(int t = 0; t < z; t++) {",
			"                C[r][s] = C[r][s] ___2___ (A[r][t] ___3___ B[t][s]);",
			"            }",
			"        }",
			"    }",
			"",
			"    if(z ___4___ 1) {",
			"        printf(\"Single cell case\");",
			"    }",
			"}"
		],
		answers: ["<=", "+", "*", "=="],
		marksPerBlank: 5
	},
	{
		id: "debug-003",
		title: "Divide-and-Locate Mechanism",
		codeTemplate: [
			"int locator(int data[], int size, int target) {",
			"    int a = 0;",
			"    int b = size - 1;",
			"",
			"    while(a ___1___ b) {",
			"        int c = a + (b - a) / 2;",
			"",
			"        if(data[c] == target) {",
			"            return ___2___;",
			"        }",
			"        else if(data[c] < target) {",
			"            a = c ___3___;",
			"        }",
			"        else {",
			"            b = c ___4___;",
			"        }",
			"    }",
			"",
			"    return -1;",
			"}"
		],
		answers: ["<=", "c", "+1", "-1"],
		marksPerBlank: 5
	}
];

export default debugQuestions;