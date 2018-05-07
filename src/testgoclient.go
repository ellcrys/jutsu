package main

import (
	"encoding/json"
	"fmt"
	"net"

	"github.com/ellcrys/rpc2" //A modified version to support JSON instead of gob
)

type Data struct {
	Foo string `json:"foo"`
}

type RespData struct {
	Name string `json:"name"`
}

type Response struct {
	Method string      `json:"method"`
	Data   interface{} `json:"data"`
}

func main() {
	conn, _ := net.Dial("tcp", "127.0.0.1:4000")

	clt := rpc2.NewClient(conn)

	go clt.Run()

	clt.Handle("hello", func(client *rpc2.Client, args interface{}, resp *Response) error {
		buf, err := json.Marshal(args)

		if err != nil {
			panic(err)
		}
		var data RespData
		json.Unmarshal(buf, &data)

		fmt.Println("hello called:", data.Name)

		return nil
	})

	data, err := json.Marshal(&Data{
		Foo: "bar",
	})
	if err != nil {
		panic(err)
	}
	clt.Call("add", data, nil)

}
