export const FAIRPAY_IDL = 
{
  "address": "Cd7cvj6DpLPnmJqvp9V2JCoxGmPqmTaSvLhTda1fHhTa",
  "metadata": {
    "name": "fairpay",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "FairPay escrow program"
  },
  "instructions": [
    {
      "name": "approve_work",
      "discriminator": [
        181,
        118,
        45,
        143,
        204,
        88,
        237,
        109
      ],
      "accounts": [
        {
          "name": "client",
          "writable": true,
          "signer": true,
          "relations": [
            "escrow"
          ]
        },
        {
          "name": "freelancer",
          "writable": true,
          "relations": [
            "escrow"
          ]
        },
        {
          "name": "escrow",
          "writable": true
        }
      ],
      "args": []
    },
    {
      "name": "initialize_escrow",
      "discriminator": [
        243,
        160,
        77,
        153,
        11,
        92,
        48,
        209
      ],
      "accounts": [
        {
          "name": "client",
          "writable": true,
          "signer": true
        },
        {
          "name": "freelancer"
        },
        {
          "name": "escrow",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  101,
                  115,
                  99,
                  114,
                  111,
                  119
                ]
              },
              {
                "kind": "account",
                "path": "client"
              },
              {
                "kind": "account",
                "path": "freelancer"
              },
              {
                "kind": "arg",
                "path": "job_title"
              }
            ]
          }
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "job_title",
          "type": "string"
        },
        {
          "name": "job_description",
          "type": "string"
        },
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "raise_dispute",
      "discriminator": [
        41,
        243,
        1,
        51,
        150,
        95,
        246,
        73
      ],
      "accounts": [
        {
          "name": "actor",
          "signer": true
        },
        {
          "name": "escrow",
          "writable": true
        }
      ],
      "args": [
        {
          "name": "client_claim",
          "type": "string"
        },
        {
          "name": "freelancer_claim",
          "type": "string"
        }
      ]
    },
    {
      "name": "resolve_dispute",
      "discriminator": [
        231,
        6,
        202,
        6,
        96,
        103,
        12,
        230
      ],
      "accounts": [
        {
          "name": "resolver",
          "writable": true,
          "signer": true,
          "address": "3eERcoNESJjiUbohhSRsuaBJsQJiQjmNDtRZmGmLEZ8b"
        },
        {
          "name": "winner",
          "writable": true
        },
        {
          "name": "escrow",
          "writable": true
        }
      ],
      "args": [
        {
          "name": "winner",
          "type": "pubkey"
        },
        {
          "name": "reasoning",
          "type": "string"
        }
      ]
    },
    {
      "name": "submit_work",
      "discriminator": [
        158,
        80,
        101,
        51,
        114,
        130,
        101,
        253
      ],
      "accounts": [
        {
          "name": "freelancer",
          "writable": true,
          "signer": true,
          "relations": [
            "escrow"
          ]
        },
        {
          "name": "escrow",
          "writable": true
        }
      ],
      "args": [
        {
          "name": "work_description",
          "type": "string"
        },
        {
          "name": "work_link",
          "type": "string"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "Escrow",
      "discriminator": [
        31,
        213,
        123,
        187,
        186,
        22,
        218,
        155
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "Unauthorized",
      "msg": "Unauthorized actor for this action"
    },
    {
      "code": 6001,
      "name": "InvalidStateTransition",
      "msg": "Invalid state transition"
    },
    {
      "code": 6002,
      "name": "InvalidAmount",
      "msg": "Amount must be greater than zero"
    },
    {
      "code": 6003,
      "name": "InvalidWinner",
      "msg": "Dispute winner must be client or freelancer"
    }
  ],
  "types": [
    {
      "name": "Escrow",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "client",
            "type": "pubkey"
          },
          {
            "name": "freelancer",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "job_title",
            "type": "string"
          },
          {
            "name": "job_description",
            "type": "string"
          },
          {
            "name": "work_description",
            "type": "string"
          },
          {
            "name": "work_link",
            "type": "string"
          },
          {
            "name": "client_claim",
            "type": "string"
          },
          {
            "name": "freelancer_claim",
            "type": "string"
          },
          {
            "name": "verdict_reasoning",
            "type": "string"
          },
          {
            "name": "state",
            "type": {
              "defined": {
                "name": "EscrowState"
              }
            }
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "EscrowState",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Active"
          },
          {
            "name": "WorkSubmitted"
          },
          {
            "name": "Disputed"
          },
          {
            "name": "Completed"
          },
          {
            "name": "Resolved"
          }
        ]
      }
    }
  ]
} as const;
